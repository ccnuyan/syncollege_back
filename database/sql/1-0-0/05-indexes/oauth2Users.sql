ALTER TABLE oauth2Users
ADD CONSTRAINT provider_key UNIQUE (provider, unique_provider_id);