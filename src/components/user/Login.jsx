import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAuthError,
  githubLogin,
  googleLogin,
  login,
} from "../../actions/userActions";
import MetaData from "../layouts/MetaData";
import { jwtDecode } from "jwt-decode";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { use } from "react";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.authState
  );
  // const locationSearch = location.search.split("=")[1]
  // console.log(locationSearch);

  // const redirect = location.search ? "/" + location.search.split("=")[1] : "/";

  const submitHandler = (e) => {
    e.preventDefault();
    if (email) {
      dispatch(login(email, password));
    }
  };

  const githubOnclick = () => {
    const clientID = "Ov23liRjDiXw1IPLAjI8";
    window.location.replace(
      "https://github.com/login/oauth/authorize?client_id=" + clientID
    );
  };
  const googleLoginBtn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // const userObject = jwtDecode(credentialResponse.access_token);

      const userInfo = await axios
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        .then((res) => res.data);
      if (await userInfo.email_verified) {
        dispatch(googleLogin(userInfo.email, userInfo.email_verified));
      } else {
        toast("Login with Google Failed", {
          position: toast.POSITION.BOTTOM_CENTER,
          type: "error",
          onOpen: () => {
            dispatch(clearAuthError);
          },
        });
      }
    },
  });

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code");
    if (code) {
      dispatch(githubLogin(code));
    }
  }, []);
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }

    if (error) {
      toast(error, {
        position: toast.POSITION.BOTTOM_CENTER,
        type: "error",
        onOpen: () => {
          dispatch(clearAuthError);
        },
      });
      return;
    }
  }, [error, isAuthenticated, dispatch, navigate]);

  return (
    <Fragment>
      <MetaData title={`Login`} />
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form onSubmit={submitHandler} className="shadow-lg">
            <h1 className="mb-3">Login</h1>
            <div className="form-group">
              <label htmlFor="email_field">Email</label>
              <input
                type="email"
                id="email_field"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password_field">Password</label>
              <input
                type="password"
                id="password_field"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Link to="/password/forgot" className="float-right mb-4">
              Forgot Password?
            </Link>

            <button
              id="login_button"
              type="submit"
              className="btn btn-block py-3"
              disabled={loading}
            >
              LOGIN
            </button>
            <div className="d-flex mt-3 justify-content-between gap-2">
              <button
                className="mr-2"
                id="googleLoginBtn"
                onClick={googleLoginBtn}
                disabled={loading}
              >
                <img src="/images/googleLogo.png" alt="" />
                <span> Sign in with Google</span>
              </button>
              <button
                className="ml-2"
                id="githubLoginBtn"
                onClick={githubOnclick}
                disabled={loading}
              >
                <img src="/images/github-sign.png" alt="" />
                <span> Sign in with github</span>
              </button>
            </div>

            <Link to="/register" className="float-right mt-3">
              New User?
            </Link>
          </form>
        </div>
      </div>
    </Fragment>
  );
}
