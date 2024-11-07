class User:
    def __init__(self, FName, LName, Email, Location, Role, PetId = [], Avatar = "", Id=""):
        self.Id = Id
        self.FName = FName
        self.LName = LName
        self.Email = Email
        self.Location = Location
        self.Role = Role
        self.PetId = PetId
        self.Avatar = Avatar
        
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
            'FName': self.FName,
            'LName': self.LName,
            'Email': self.Email,
            'Location': self.Location,
            'Role': self.Role
        }
        if self.Id:
            user['Id'] = self.Id
        if self.PetId: 
            user['PetId'] = self.PetId
        if self.Avatar:
            user['Avatar'] = self.Avatar
        return user
    
    def __repr__(self):
        return (
            f"User(FName={self.FName}, LName={self.LName}, Email={self.Email}, "
            f"Avatar={self.Avatar}, Location={self.Location}, Role={self.Role}, "
            f"PetId={self.PetId}), Id={self.Id}"
        )