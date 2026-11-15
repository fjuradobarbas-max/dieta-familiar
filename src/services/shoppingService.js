import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "./firebase";

export const subscribeWeight = (
  persona,
  callback
) => {
  return onSnapshot(
    doc(db, "weights", persona),
    (snapshot) => {
      callback({
        id: snapshot.id,
        ...snapshot.data(),
      });
    }
  );
};