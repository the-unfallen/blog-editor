const loadHomePage = (req, res) => {
    res.json({ message: "Welcome home" });
};

module.exports = {
    loadHomePage,
};
