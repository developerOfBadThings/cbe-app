import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  docData,
  doc,
  addDoc,
  deleteDoc,
  updateDoc
} from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private firestore: Firestore,
  ) {

  }

  getNotes(dbTable) {
    const notesRef = collection(this.firestore, dbTable);
    return collectionData(notesRef, { idField: 'firebaseId' });
  }

  getNote(id, dbTable) {
    const notesDocRef = doc(this.firestore, `${dbTable}/${id}`);
    return docData(notesDocRef, { idField: 'firebaseId' });
  }

  updateNote(note, dbTable) {
    const noteDocRef = doc(this.firestore, `${dbTable}/${note.firebaseId}`);
    return updateDoc(noteDocRef, note);
  }

  addNote(note, dbTable) {
    const notesRef = collection(this.firestore, dbTable);
    return addDoc(notesRef, note);
  }

  removeNote(note, dbTable) {
    const noteDocRef = doc(this.firestore, `${dbTable}/${note.firebaseId}`);
    return deleteDoc(noteDocRef);
  }

}
