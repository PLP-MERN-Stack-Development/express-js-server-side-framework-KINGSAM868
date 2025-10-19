// server.js
router.get('/search', asyncWrap(async (req, res) => {
const q = req.query.q;
if (!q) throw new ValidationError('Query param `q` is required');
const term = String(q).toLowerCase();
const results = products.filter(p => p.name.toLowerCase().includes(term));
res.json({ total: results.length, data: results });
}));


// GET /api/products/stats
router.get('/stats', asyncWrap(async (req, res) => {
const stats = products.reduce((acc, p) => {
acc.total = (acc.total || 0) + 1;
acc.byCategory = acc.byCategory || {};
acc.byCategory[p.category] = (acc.byCategory[p.category] || 0) + 1;
return acc;
}, {});
res.json(stats);
}));


// GET single product
router.get('/:id', asyncWrap(async (req, res) => {
const p = products.find(x => x.id === req.params.id);
if (!p) throw new NotFoundError('Product not found');
res.json(p);
}));


// POST create product
router.post('/', validateProductCreation, asyncWrap(async (req, res) => {
const { name, description, price, category, inStock } = req.body;
const newProduct = { id: uuidv4(), name, description, price, category, inStock };
products.push(newProduct);
res.status(201).json(newProduct);
}));


// PUT update product
router.put('/:id', validateProductUpdate, asyncWrap(async (req, res) => {
const idx = products.findIndex(x => x.id === req.params.id);
if (idx === -1) throw new NotFoundError('Product not found');
const updated = Object.assign({}, products[idx], req.body);
products[idx] = updated;
res.json(updated);
}));


// DELETE product
router.delete('/:id', asyncWrap(async (req, res) => {
const idx = products.findIndex(x => x.id === req.params.id);
if (idx === -1) throw new NotFoundError('Product not found');
const [deleted] = products.splice(idx, 1);
res.json({ deleted });
}));


app.use('/api/products', router);


// Global error handler
app.use((err, req, res, next) => {
if (!(err instanceof AppError)) {
console.error('Unexpected error:', err);
err = new AppError('Internal Server Error', 500);
}
res.status(err.status || 500).json({ error: err.message });
});


// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));


module.exports = app; // handy for tests