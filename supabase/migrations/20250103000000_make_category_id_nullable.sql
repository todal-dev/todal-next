-- Make category_id nullable to support default categories
ALTER TABLE todos ALTER COLUMN category_id DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN todos.category_id IS 'Foreign key to categories table. NULL means default/uncategorized todo.';


