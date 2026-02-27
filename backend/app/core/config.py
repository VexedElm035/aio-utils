from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    frontend_origin: str = "http://localhost:5173"

    class Config:
        env_prefix = "AIO_"

    @property
    def allowed_origins(self) -> list[str]:
        return [self.frontend_origin]


settings = Settings()
