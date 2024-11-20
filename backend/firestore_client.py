from connect_firebase import PawnderFirebase
from google.cloud import firestore

pawnder_firebase = PawnderFirebase()
db = firestore.Client()
