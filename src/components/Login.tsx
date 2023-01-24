import { DB, useAppContext } from "../App";
import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Stack from "@mui/material/Stack";
import bcrypt from "bcryptjs";
import axios from "axios";
import TextField from "@mui/material/TextField";

const LoginForm = () => {
    const { setAdmin, setUser, setStatus, status, user, admin } = useAppContext();

    const [login, setLogin] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [repetedPassword, setRepetedPassword] = useState<string>("");
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        if (user !== undefined) {
            setUser(undefined);
            setAdmin(false);
            setStatus("none");
        }
    }, []);

    const logIn = () => {
        validate();
        if (error) return;
        axios
            .get(`http://${DB}/accounts/${login}`)
            .then((response) => {
                if (bcrypt.compareSync(password, response.data?.password)) {
                    setUser(response.data?.id);
                    if (response.data?.id == "admin") {
                        setAdmin(true);
                    }
                    setStatus("none");
                } else setError(true);
            })
            .catch((err) => {
                setError(true);
            });
    };

    const registerNew = () => {
        validate();
        if (error) return;
        var hash = bcrypt.hashSync(password, 10);
        axios.post(`http://${DB}/accounts/`, { id: login, password: hash }).catch((err) => setError(true));
        if (!error) logIn();
    };

    const validate = () => {
        if (login === "" || login.length < 3) {
            setError(true);
            return;
        }
        if (password === "") {
            setError(true);
            return;
        }
        if (status === "register" && password !== repetedPassword) {
            setError(true);
            return;
        }
        setError(false);
    };

    const errorHandle = () => {
        if (error) {
            if (status == "login") return <Typography>Nieprawidłowe dane logowania!</Typography>;
            else return <Typography>Hasła się nie zgadzają lub konto już istnieje!</Typography>;
        } else return <></>;
    };
    const switchStatus = () => {
        if (status === "login") setStatus("register");
        else setStatus("login");
    };

    const repeatPasswordField = () => {
        if (status == "register")
            return (
                <FormControl fullWidth>
                    <TextField type="password" label="Powtórz Hasło" onInput={(e: React.ChangeEvent<HTMLInputElement>) => setRepetedPassword(e.target.value)} />
                </FormControl>
            );
        else return <></>;
    };

    return (
        <Stack spacing={2} width={500} direction="column" justifyContent="center" alignItems="center">
            <Typography variant="h5" align="center">
                {status === "login" ? "Zaloguj" : "Zarejestruj"}
            </Typography>
            {errorHandle()}
            <FormControl fullWidth>
                <TextField label="Login" onInput={(e: React.ChangeEvent<HTMLInputElement>) => setLogin(e.target.value)} />
            </FormControl>
            <FormControl fullWidth>
                <TextField type="password" label="Hasło" onInput={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
            </FormControl>
            {repeatPasswordField()}
            <Button variant="contained" onClick={status === "login" ? logIn : registerNew}>
                {status === "login" ? "Zaloguj" : "Zarejestruj"}
            </Button>
            <Typography onClick={switchStatus}> {status === "login" ? "Nie masz konta?" : "Masz już konto?"}</Typography>
        </Stack>
    );
};

export default LoginForm;
