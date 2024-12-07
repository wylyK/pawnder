class Reminder:
    def __init__(self, Name, DateTime, Description):
        self.Name = Name
        self.DateTime = DateTime
        self.Description = Description

    @staticmethod
    def from_dict(source):
        reminder = Reminder(
            Name=source['Name'],
            DateTime=source['DateTime'],
            Description=source['Description'],
        )
        return reminder
    
    def to_dict(self):
        reminder = {
            "Name": self.Name,
            "DateTime": self.DateTime,
            "Description": self.Description,
        }
        return reminder
    
    def __repr__(self):
        return f"Reminder(Name={self.Name}, DateTime={self.DateTime}, Description={self.Description})"