import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../auth/firebase";
import { useNavigate } from "react-router-dom";
import { toastErrorNotify, toastSuccessNotify, toastWarnNotify } from "../helper/ToastNotify";

export const AuthContext = createContext();

// with custom hook
export const useAuthContext = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    userObserver();
  }, []);

  const createUser = async (email, password, displayName) => {
    try {
      let userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(auth.currentUser, {
        displayName,
        // displayName: displayName
      });
      //    console.log(userCredential);
      navigate("/");
      toastSuccessNotify("Registered successfully");
    } catch (error) {
      // console.log(error)
      toastErrorNotify(error.message);
    }
  };

  //* https://console.firebase.google.com/
  //* => Authentication => sign-in-method => enable Email/password
  //! Email/password ile girişi enable yap

  const signIn = async (email, password) => {
    try {
      let userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      navigate("/");
      toastSuccessNotify("Logged in successfully");
    } catch (error) {
      toastErrorNotify(error.message);
    }
  };

  const logOut = () => {
    signOut(auth).then(() => {
      // Sign-out successful.
      toastSuccessNotify("Logged out successfully");
    });
    //   .catch(error) ; {
    //     // An error happened.
    //     toastErrorNotify(error.message);
    //   };
  };

  const userObserver = () => {
     //? Kullanıcının signin olup olmadığını takip eden ve kullanıcı değiştiğinde yeni kullanıcıyı response olarak dönen firebase metodu
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const { email, displayName, photoUrl } = user;
        setCurrentUser({ email, displayName, photoUrl });
      } else {
        setCurrentUser(false);
      }
    });
  };

    //* https://console.firebase.google.com/
  //* => Authentication => sign-in-method => enable Google
  //! Google ile girişi enable yap
  //* => Authentication => settings => Authorized domains => add domain
  //! Projeyi deploy ettikten sonra google sign-in çalışması için domain listesine deploy linkini ekle

  const googleProvider = () => {
    //? Google ile giriş yapılması için kullanılan firebase metodu
    const provider = new GoogleAuthProvider();
     //? Açılır pencere ile giriş yapılması için kullanılan firebase metodu
    signInWithPopup(auth, provider)
  .then((result) => {
    console.log(result)
    navigate("/")
    toastSuccessNotify("Logged in succesfully")
    }).catch((error) => {
    // Handle Errors here.
    console.log(error)
    toastErrorNotify(error.message)
    });
  }

  const forgotPassword = (email) => {
      //? Email yoluyla şifre sıfırlama için kullanılan firebase metodu
    sendPasswordResetEmail(auth, email)
  .then(() => {
    // Password reset email sent!
    toastWarnNotify("Please check your mail box")
  })
  .catch((error) => {
   toastErrorNotify(error.message)
  });
  }
  const values = { currentUser, createUser, signIn, logOut, googleProvider, forgotPassword };
  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
