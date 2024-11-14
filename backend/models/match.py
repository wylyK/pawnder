from enum import Enum

class Status(Enum):
    PENDING = "pending"
    MATCHED = "matched"

class Match:
    def __init__(self, PetId, Status=Status.PENDING.value):
        self.PetId = PetId
        self.Status = Status

    @staticmethod
    def from_dict(source):
        if 'PetId' not in source:
            raise ValueError("PetId is missing in the provided data.")
        match = Match(source['PetId'])
        if 'Status' in source:
            match.Status = source['Status']
        else:
            match.Status = Status.PENDING.value
        return match
    
    def to_dict(self):
        match = {
            'PetId': self.PetId,
            'Status': self.Status,
        }
        return match
    
    def __repr__(self):
        return(
            f"Match(PetId={self.PetId}, Status={self.Status})"
        )
