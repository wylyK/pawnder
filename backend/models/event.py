from enum import Enum
class Type(Enum):
    APPOINTMENT = "appointment"
    ROUTINE_CHECKUP = "routine_checkup"
    SURGERY = "surgery"
    VACCINATION = "vaccination"
    EMERGENCY_VISIT = "emergency_visit"
    OTHER = "other"

class Status(Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELED = "canceled"

class Event:
    def __init__(self, Name, DateTime, Duration, Location, CreatedBy, CreatedAt, VetAssigned, Type, Status=Status.SCHEDULED.value, Description="", FollowUp="",):
        self.Name = Name
        self.DateTime = DateTime
        self.Duration = Duration
        self.Location = Location
        self.CreatedBy = CreatedBy
        self.CreatedAt = CreatedAt
        self.VetAssigned = VetAssigned
        self.Type = Type
        self.Status = Status
        self.Description = Description
        self.FollowUp = FollowUp

    @staticmethod
    def from_dict(source):
        if 'Name' not in source:
            raise ValueError("Name is missing in the provided data.")
        if 'DateTime' not in source:
            raise ValueError("DateTime is missing in the provided data.")
        if 'Duration' not in source:
            raise ValueError("Duration is missing in the provided data.")
        if 'Location' not in source:
            raise ValueError("Location is missing in the provided data.")
        if 'CreatedBy' not in source:
            raise ValueError("CreatedBy is missing in the provided data.")
        if 'CreatedAt' not in source:
            raise ValueError("CreatedAt is missing in the provided data.")
        if 'VetAssigned' not in source:
            raise ValueError("VetAssigned is missing in the provided data.")
        if 'Type' not in source:
            raise ValueError("Type is missing in the provided data.")
        event = Event(
            source['Name'],
            source['DateTime'],
            source['Duration'],
            source['Location'],
            source['CreatedBy'],
            source['CreatedAt'],
            source['VetAssigned'],
            source['Type']
        )
        if 'Status' in source:
            event.Status = source['Status']
        if 'Description' in source:
            event.Description = source['Description']
        if 'FollowUp' in source:
            event.FollowUp = source['FollowUp']
        return event
    
    def to_dict(self):
        event = {
            'Name': self.Name,
            'DateTime': self.DateTime,
            'Duration': self.Duration,
            'Location': self.Location,
            'CreatedBy': self.CreatedBy,
            'CreatedAt': self.CreatedAt,
            'VetAssigned': self.VetAssigned,
            'Type': self.Type,
            'Status': self.Status,
            'Description': self.Description,
            'FollowUp': self.FollowUp,
        }
        return event
    
    def __repr__(self):
        return(
            f"Event(Name={self.Name}, DateTime={self.DateTime}, Duration={self.Duration}, Location={self.Location}, CreatedBy={self.CreatedBy}, CreatedAt={self.CreatedAt}, VetAssigned={self.VetAssigned}, Type={self.Type}, Status={self.Status}, Description={self.Description}, FollowUp={self.FollowUp})"
        )