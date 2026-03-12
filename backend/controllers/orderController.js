const { supabase } = require('../config/supabase');

const createOrder = async (req, res) => {
  try {
    const { products, total } = req.body;

    if (!Array.isArray(products) || products.length === 0 || total === undefined) {
      return res.status(400).json({ message: 'products and total are required.' });
    }

    // 1) create order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id || req.user._id, // support existing middleware payload
        total,
        status: 'pending',
      })
      .select('*')
      .single();

    if (orderErr) {
      return res.status(500).json({ message: 'Failed to create order.', error: orderErr.message });
    }

    // 2) insert order items
    const items = products.map((p) => ({
      order_id: order.id,
      product_id: p.productId,
      name: p.name,
      price: p.price,
      quantity: p.quantity,
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(items);
    if (itemsErr) {
      // optional rollback
      await supabase.from('orders').delete().eq('id', order.id);
      return res.status(500).json({ message: 'Failed to save order items.', error: itemsErr.message });
    }

    return res.status(201).json({
      message: 'Order created.',
      order: { ...order, products },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create order.', error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';

    let query = supabase
      .from('orders')
      .select(`
        id,
        user_id,
        total,
        status,
        created_at,
        users:user_id (id, name, email, role),
        order_items (
          product_id,
          name,
          price,
          quantity
        )
      `)
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', req.user.id || req.user._id);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
    }

    // map to your previous response shape
    const orders = data.map((o) => ({
      id: o.id,
      userId: o.user_id,
      total: o.total,
      status: o.status,
      createdAt: o.created_at,
      user: o.users,
      products: (o.order_items || []).map((i) => ({
        productId: i.product_id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    }));

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'status is required.' });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: 'Failed to update order.', error: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.status(200).json({ message: 'Order status updated.', order: data });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update order.', error: error.message });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus };