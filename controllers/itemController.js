// Create new item
const createItem = async (req, res) => {
    console.log('Received create item request with body:', req.body);

    const { id, description, price, quantity } = req.body;
    console.log('Extracted values:', { id, description, price, quantity });

    if (!description || !price || quantity === undefined) {
        console.log('Missing required fields. Received:', { description, price, quantity });
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['description', 'price', 'quantity'],
            received: req.body
        });
    }

    try {
        let query, params;

        if (id) {
            // Use custom ID if provided
            console.log('Using custom ID:', id);
            query = 'INSERT INTO items (id, description, price, quantity) VALUES (?, ?, ?, ?)';
            params = [id, description, price, quantity];
        } else {
            // Generate UUID if no custom ID provided
            console.log('Generating UUID for new item');
            query = 'INSERT INTO items (id, description, price, quantity) VALUES (UUID(), ?, ?, ?)';
            params = [description, price, quantity];
        }

        console.log('Attempting to insert item with query:', query, 'and params:', params);
        const [result] = await pool.query(query, params);
        console.log('Insert result:', result);

        // Get the newly created item
        const [rows] = await pool.query(
            'SELECT * FROM items WHERE description = ? ORDER BY created_at DESC LIMIT 1',
            [description]
        );
        console.log('Retrieved item:', rows[0]);

        if (rows.length === 0) {
            throw new Error('Failed to retrieve newly created item');
        }

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({
            error: 'Error creating item',
            details: error.message
        });
    }
};