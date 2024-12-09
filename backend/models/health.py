class Health:
    def __init__(self, VetId = "", Weight = None, Height = None, Diet="", Prescription="", Insurance = ""):
        self.VetId = VetId
        self.Weight = Weight
        self.Height = Height
        self.Diet = Diet
        self.Prescription = Prescription
        self.Insurance = Insurance

    @staticmethod
    def from_dict(source):
        health = Health(
            source.get('VetId', ""),
            source.get('Weight', None),
            source.get('Height', None),
            source.get('Diet', ""),
            source.get('Prescription', ""),
            source.get('Insurance', "")
        )
        return health
    
    def to_dict(self):
        health = {
            'VetId': self.VetId,
            'Weight': self.Weight,
            'Height': self.Height,
            'Diet': self.Diet,
            'Prescription': self.Prescription,
            'Insurance' : self.Insurance
        }
        return health
    
    def __repr__(self):
        return(
            f"Health(VetId={self.VetId}, Weight={self.Weight}, Height={self.Height}, Diet={self.Diet}, Insurance={self.Insurance}, Prescription={self.Prescription} )"
        )