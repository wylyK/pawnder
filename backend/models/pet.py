class Pet:
    def __init__(self, name, age, breed, avatar, location, description, userId, petID=""):
        self.id = petID
        self.name = name
        self.age = age
        self.breed = breed
        self.avatar = avatar
        self.location = location
        self.description = description
        self.userId = userId

    @staticmethod
    def from_dict(source):
        pet = Pet(source['id'], source['name'], source['age'], source['breed'], source['avatar'], source['location'], source['description'], source['userId'])
        return pet
    
    def to_dict(self):
        pet = {
            'name': self.name,
            'age': self.age,
            'breed': self.breed,
            'avatar': self.avatar,
            'location': self.location,
            'description': self.description,
            'userId': self.userId
        }
        return pet
    
    def __repr__(self):
        return(
            f"Pet(name={self.name}, age={self.age}, breed={self.breed}, avatar={self.avatar}, location={self.location}, description={self.description}, userId={self.userId})"
        )