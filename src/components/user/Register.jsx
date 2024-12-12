import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  register,
  clearAuthError,
  googleRegister,
  githubRegister,
} from "../../actions/userActions";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import Loader from "../layouts/Loader";
import axios from "axios";
import MetaData from "../layouts/MetaData";
export default function Register() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(
    "/images/default_avatar.png"
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.authState
  );
  const googleRegiterBtn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const userInfo = await axios
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        .then((res) => res.data);
      if (await userInfo.email_verified) {
        const user = {
          name: userInfo.name,
          email: userInfo.email,
          avatar: userInfo.picture,
        };
        dispatch(googleRegister(user));
      } else {
        toast("Signup with Google Failed", {
          position: toast.POSITION.BOTTOM_CENTER,
          type: "error",
          onOpen: () => {
            dispatch(clearAuthError);
          },
        });
      }
    },
  });
  const onChange = (e) => {
    if (e.target.name === "avatar") {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setAvatar(e.target.files[0]);
        }
      };

      reader.readAsDataURL(e.target.files[0]);
    } else {
      setUserData({ ...userData, [e.target.name]: e.target.value });
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("avatar", avatar);
    if (userData.email) {
      dispatch(register(formData));
    }
  };

  const githubRegisterOnclick = () => {
    const clientID = "Ov23liK9wRtjpMeKXjXL";
    window.location.assign(
      "https://github.com/login/oauth/authorize?client_id=" + clientID
    );
  };

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code");
    if (code) {
      dispatch(githubRegister({ code }));
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
      return;
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
    <div className="row wrapper">
      <MetaData title={"Register"} />
      <div className="col-10 col-lg-5">
        {loading && <Loader />}
        <form
          onSubmit={submitHandler}
          className="shadow-lg"
          encType="multipart/form-data"
        >
          <h1 className="mb-3">Register</h1>

          <div className="form-group">
            <label htmlFor="email_field">Name</label>
            <input
              name="name"
              onChange={onChange}
              type="name"
              id="name_field"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email_field">Email</label>
            <input
              type="email"
              id="email_field"
              name="email"
              onChange={onChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password_field">Password</label>
            <input
              name="password"
              onChange={onChange}
              type="password"
              id="password_field"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="avatar_upload">Avatar</label>
            <div className="d-flex align-items-center">
              <div>
                <figure className="avatar mr-3 item-rtl">
                  <img
                    src={avatarPreview}
                    className="rounded-circle"
                    alt="Avatar"
                  />
                </figure>
              </div>
              <div className="custom-file">
                <input
                  type="file"
                  name="avatar"
                  onChange={onChange}
                  className="custom-file-input"
                  id="customFile"
                />
                <label className="custom-file-label" htmlFor="customFile">
                  Choose Avatar
                </label>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-between">
            <button
              className="mr-2"
              id="googleLoginBtn"
              onClick={googleRegiterBtn}
              disabled={loading}
            >
              <img src="/images/googleLogo.png" alt="" />
              <span>Sign Up with Google</span>
            </button>

            <button
              className="ml-2"
              id="githubRegisterBtn"
              onClick={githubRegisterOnclick}
            >
              <img src="/images/github-sign.png" alt="" />
              <span> Sign up with github</span>
            </button>
          </div>
          <button
            id="register_button"
            type="submit"
            className="btn btn-block py-3"
            disabled={loading}
          >
            REGISTER
          </button>
        </form>
      </div>
    </div>
  );
}
