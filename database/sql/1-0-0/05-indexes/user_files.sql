ALTER TABLE files
ADD CONSTRAINT user_files
FOREIGN KEY (uploader_id) REFERENCES users(id)
ON DELETE CASCADE;