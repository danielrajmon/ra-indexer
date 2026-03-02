CREATE TABLE IF NOT EXISTS games (
  platform_id INTEGER NOT NULL REFERENCES platforms(platform_id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL,
  game_title VARCHAR(512) NOT NULL,
  is_required BOOLEAN DEFAULT NULL,
  is_owned BOOLEAN NOT NULL DEFAULT FALSE,
  achievement_count INTEGER NOT NULL DEFAULT 0 CHECK (achievement_count >= 0),
  leaderboard_count INTEGER NOT NULL DEFAULT 0 CHECK (leaderboard_count >= 0),
  point_total INTEGER NOT NULL DEFAULT 0 CHECK (point_total >= 0),
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (platform_id, game_id)
);


CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_games_set_updated_at
BEFORE UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


CREATE INDEX IF NOT EXISTS idx_games_platform_id ON games(platform_id);
CREATE INDEX IF NOT EXISTS idx_games_game_id ON games(game_id);