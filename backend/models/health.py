class Health:
    def __init__(self, weight: int, drug: str, diet: str, petId: str):
        self.weight = weight
        self.drug = drug
        self.diet = diet
        self.petId = petId

    @staticmethod
    def from_dict(source):
        health = Health(source['weight'], source['drug'], source['diet'], source['petId'])
        return health

    def to_dict(self):
        health = {
            'weight': self.weight,
            'drug': self.drug,
            'diet': self.diet,
            'petId': self.petId
        }
        return health
    
    def __repr__(self):
        return(
            f"Health(weight={self.weight}, drug={self.drug}, diet={self.diet}, petId={self.petId})"
        )