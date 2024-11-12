class Health:
    def __init__(self, VetId = [], Weight = None, Height = None, Diet="", Medicine=[]):
        self.VetId = VetId
        self.Weight = Weight
        self.Height = Height
        self.Diet = Diet
        self.Medicine = Medicine

    @staticmethod
    def from_dict(source):
        health = Health(
            source.get('VetId', []),
            source.get('Weight', None),
            source.get('Height', None),
            source.get('Diet', ""),
            source.get('Medicine', [])
        )
        return health
    
    def to_dict(self):
        health = {
            'VetId': self.VetId,
            'Weight': self.Weight,
            'Height': self.Height,
            'Diet': self.Diet,
            'Medicine': self.Medicine
        }
        return health
    
    def __repr__(self):
        return(
            f"Health(VetId={self.VetId}, Weight={self.Weight}, Height={self.Height}, Diet={self.Diet}, Medicine={self.Medicine})"
        )