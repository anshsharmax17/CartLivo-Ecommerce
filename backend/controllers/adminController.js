const supabase = require("../config/supabase");

exports.getAllUsers = async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("id,name,email,role,created_at");

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json(data);
};