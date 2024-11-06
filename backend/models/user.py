class User:
    def __init__(self, FName, LName, email, location, role, PetId, avatar, userId=""):
        self.Id = userId
        self.FName = FName
        self.LName = LName
        self.email = email
        self.location = location
        self.role = role
        self.PetId = PetId
        self.avatar = avatar
        
    def from_dict(source):
        user = User( 
            source['FName'], 
            source['LName'], 
            source['Email'], 
            source['Location'], 
            source['Role'],
            source.get('PetId', []),
            source.get('Avatar', ""),
            source.get('Id', "")
        )
        
        return user
    
    def to_dict(self):
        user = {
            'Id': self.Id,
            'FName': self.FName,
            'LName': self.LName,
            'Email': self.email,
            'Avatar': self.avatar,
            'Location': self.location,
            'Role': self.role
        }
        if self.PetId: 
            user['PetId'] = self.PetId
        return user
    
    def __repr__(self):
        return (
            f"User(FName={self.FName}, LName={self.LName}, Email={self.email}, "
            f"Avatar={self.avatar}, Location={self.location}, Role={self.role}, "
            f"PetId={self.PetId}), "
        )