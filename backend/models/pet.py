class Pet:
    def __init__(self, name, age, breed, avatar, location, description, weight, drug, diet, userId, petID=""):
        self.petId = petID
        self.name = name
        self.age = age
        self.breed = breed
        self.avatar = avatar
        self.location = location
        self.description = description
        self.weight = weight
        self.drug = drug
        self.diet = diet
        self.userId = userId

    @staticmethod
    def from_dict(source):
        pet = Pet(source['petId'], source['name'], source['age'], source['breed'], source['avatar'], source['location'], source['description'], source['userId'])
        if 'weight' in source:
            pet.weight = source['weight']
        if 'drug' in source:
            pet.drug = source['drug']
        if 'diet' in source:
            pet.diet = source['diet']
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
        if self.weight:
            pet['weight'] = self.weight
        if self.drug:
            pet['drug'] = self.drug
        if self.diet:
            pet['diet'] = self.diet
        return pet
    
    def __repr__(self):
        return(
            f"Pet(name={self.name}, age={self.age}, breed={self.breed}, avatar={self.avatar}, location={self.location}, description={self.description}, weight={self.weight}, drug={self.drug}, diet={self.diet}, userId={self.userId})"
        )