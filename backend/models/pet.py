from backend.models.health import Health
from backend.models.match import Match
from backend.models.event import Event
class Pet:
    def __init__(self, Name, Age, Breed, Type, Avatar, UserID, Description="", Tag=[], HealthRecords=[], MatchRecords=[], EventRecords=[], ID=""):
        self.ID = ID
        self.Name = Name
        self.Age = Age
        self.Breed = Breed
        self.Type = Type
        self.Avatar = Avatar
        self.Description = Description
        self.Tag = Tag
        self.UserID = UserID
        self.HealthRecords = HealthRecords
        self.MatchRecords = MatchRecords
        self.EventRecords = EventRecords

    @staticmethod
    def from_dict(source):
        pet = Pet(
            source['Name'],
            source['Age'],
            source['Breed'],
            source['Type'],
            source['Avatar'],
            source.get('UserID', ""),
            source.get('Description', ""),
            source.get('Tag', []),
            [Health.from_dict(health) for health in source.get('HealthRecords', [])],
            [Match.from_dict(match) for match in source.get('MatchRecords', [])],
            [Event.from_dict(event) for event in source.get('EventRecords', [])],
            source.get('ID', "")
        )
        return pet

    def to_dict(self):
        pet = {
            'ID': self.ID,
            'Name': self.Name,
            'Age': self.Age,
            'Breed': self.Breed,
            'Type': self.Type,
            'Avatar': self.Avatar,
            'UserID': self.UserID,
            'Description': self.Description,
            'Tag': self.Tag,
            'HealthRecords': [health.to_dict() for health in self.HealthRecords],
            'MatchRecords': [match.to_dict() for match in self.MatchRecords],
            'EventRecords': [event.to_dict() for event in self.EventRecords]
        }
        return pet

    def __repr__(self):
        return (
            f"Pet(Name={self.Name}, Age={self.Age}, Breed={self.Breed}, "
            f"Avatar={self.Avatar}, Description={self.Description}, UserID={self.UserID}, "
            f"HealthRecords={self.HealthRecords}, MatchRecords={self.MatchRecords}, "
            f"EventRecords={self.EventRecords})"
        )
