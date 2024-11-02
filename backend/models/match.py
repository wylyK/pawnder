from enum import Enum

class Status(Enum):
    PENDING = "pending"
    MATCHED = "matched"

class Match:
    def __init__(self, myPetID, petID, status=Status.PENDING.value):
        self.myPetID = myPetID
        self.petID = petID
        self.status = status

    @staticmethod
    def from_dict(source):
        match = Match(source['myPetID'], source['petID'])
        if 'status' in source:
            match.status = source['status']
        else:
            match.status = Status.PENDING.value
        return match
    
    def to_dict(self):
        match = {
            'myPetID': self.myPetID,
            'petID': self.petID,
            'status': self.status,
        }
        return match
    
    def __repr__(self):
        return(
            f"Match(myPetID={self.myPetID}, petID={self.petID}, status={self.status})"
        )
    
    def set_status_to_match(self):
        self.status = Status.MATCHED.value
