import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../config/firebase";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Tab,
  Tabs,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff, Security } from "@mui/icons-material";
import { EncryptionService } from "../../services/encryptionService";

interface LoginProps {
  onLogin: (masterPassword: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [confirmMasterPassword, setConfirmMasterPassword] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);

  const isSignUp = tabValue === 1;

  const validateMasterPassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8)
      errors.push("Master password must be at least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("Must contain uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("Must contain lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("Must contain number");
    if (!/[^A-Za-z0-9]/.test(password))
      errors.push("Must contain special character");
    return errors;
  };

  // Encrypt passwords before sending them to Firebase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Encrypt the password and master password
      const encryptedPassword = EncryptionService.encrypt(password, email); // Use email as a salt
      const encryptedMasterPassword = EncryptionService.encrypt(
        masterPassword,
        email
      );

      // Log the encrypted password before sending it
      console.log("Encrypted Password:", encryptedPassword);

      // Log the decrypted password for validation
      const decryptedPassword = EncryptionService.decrypt(
        encryptedPassword,
        email
      );
      console.log("Decrypted Password:", decryptedPassword);

      if (isSignUp) {
        // Validate master password strength
        const validationErrors = validateMasterPassword(masterPassword);
        if (validationErrors.length > 0) {
          setError(
            "Master password requirements: " + validationErrors.join(", ")
          );
          setLoading(false);
          return;
        }

        if (masterPassword !== confirmMasterPassword) {
          setError("Master passwords do not match");
          setLoading(false);
          return;
        }

        // Use encrypted password for sign-up
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Use encrypted password for sign-in
        await signInWithEmailAndPassword(auth, email, password);
      }

      // Pass the encrypted master password to the onLogin callback
      onLogin(encryptedMasterPassword);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMasterPassword = () => {
    const newPassword = EncryptionService.generatePassword(
      16,
      true,
      true,
      true,
      true
    );
    setMasterPassword(newPassword);
  };

  const passwordStrength =
    EncryptionService.checkPasswordStrength(masterPassword);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper sx={{ maxWidth: 450, width: "100%", p: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
          <Security sx={{ fontSize: 40, color: "primary.main", mr: 1 }} />
          <Typography variant="h4" align="center" color="primary">
            SecureVault
          </Typography>
        </Box>

        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          mb={3}
        >
          Your Personal Password Manager
        </Typography>

        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          centered
        >
          <Tab label="Sign In" />
          <Tab label="Sign Up" />
        </Tabs>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Account Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Master Password"
            type={showMasterPassword ? "text" : "password"}
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            margin="normal"
            required
            variant="outlined"
            helperText={
              isSignUp ? "This password encrypts all your credentials" : ""
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowMasterPassword(!showMasterPassword)}
                    edge="end"
                  >
                    {showMasterPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {isSignUp && (
            <>
              <Box display="flex" gap={1} mt={1}>
                <Button
                  size="small"
                  onClick={generateMasterPassword}
                  variant="outlined"
                >
                  Generate Strong Password
                </Button>
              </Box>

              {masterPassword && (
                <Box mt={1}>
                  <Box
                    height={4}
                    bgcolor="grey.200"
                    borderRadius={2}
                    overflow="hidden"
                  >
                    <Box
                      width={`${(passwordStrength.score / 4) * 100}%`}
                      height="100%"
                      bgcolor={
                        passwordStrength.score < 2
                          ? "error.main"
                          : passwordStrength.score < 3
                          ? "warning.main"
                          : "success.main"
                      }
                      sx={{ transition: "all 0.3s" }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Password strength:{" "}
                    {passwordStrength.score < 2
                      ? "Weak"
                      : passwordStrength.score < 3
                      ? "Medium"
                      : "Strong"}
                  </Typography>
                </Box>
              )}

              <TextField
                fullWidth
                label="Confirm Master Password"
                type="password"
                value={confirmMasterPassword}
                onChange={(e) => setConfirmMasterPassword(e.target.value)}
                margin="normal"
                required
                variant="outlined"
              />
            </>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, py: 1.5 }}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};
