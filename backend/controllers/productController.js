const { supabase } = require('../config/supabase');

const getProducts = async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch products.', error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch products.', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch product.', error: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch product.', error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, image, stock } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'name and price are required.' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({ name, price, description, category, image, stock })
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to create product.', error: error.message });
    }

    return res.status(201).json({ message: 'Product created.', product: data });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create product.', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(req.body)
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: 'Failed to update product.', error: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.status(200).json({ message: 'Product updated.', product: data });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update product.', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: 'Failed to delete product.', error: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.status(200).json({ message: 'Product deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete product.', error: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };