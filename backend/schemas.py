# schemas.py
from pydantic import BaseModel

class ReplySchema(BaseModel):
    to_email: str
    subject: str
    message: str
