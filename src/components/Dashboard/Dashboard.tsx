import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Box,
  AppBar,
  Toolbar,
  Badge,
  Fab,
  Alert,
  InputAdornment,
  Snackbar,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Add,
  Visibility,
  VisibilityOff,
  ContentCopy,
  Edit,
  Delete,
  Search,
  FilterList,
  Logout,
  Star,
  StarBorder,
  Warning,
  History,
  MoreVert,
} from "@mui/icons-material";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import { Credential, CredentialCategory } from "../../types/credential";
import { CredentialService } from "../../services/credentialService";
import { EncryptionService } from "../../services/encryptionService";

interface DashboardProps {
  masterPassword: string;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  masterPassword,
  onLogout,
}) => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>(
    []
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedCredential, setSelectedCredential] =
    useState<Credential | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CredentialCategory | "">(
    ""
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [remindersCount, setRemindersCount] = useState(0);
  const [showPasswordReminders, setShowPasswordReminders] = useState(false);
  const [passwordReminders, setPasswordReminders] = useState<Credential[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCredentialForMenu, setSelectedCredentialForMenu] =
    useState<Credential | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: CredentialCategory.OTHER,
    username: "",
    password: "",
    website: "",
    notes: "",
    tags: [] as string[],
    isFavorite: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadCredentials();
    checkPasswordReminders();
  }, []);

  useEffect(() => {
    filterCredentials();
  }, [credentials, searchQuery, categoryFilter, showFavoritesOnly]);

  const loadCredentials = async () => {
    try {
      const creds = await CredentialService.getCredentials(masterPassword);
      setCredentials(creds);
    } catch (error) {
      console.error("Failed to load credentials:", error);
      showSnackbar("Failed to load credentials");
    }
  };

  const checkPasswordReminders = async () => {
    try {
      const reminders =
        await CredentialService.getCredentialsNeedingPasswordChange();
      setPasswordReminders(reminders);
      setRemindersCount(reminders.length);
    } catch (error) {
      console.error("Failed to check password reminders:", error);
    }
  };

  const filterCredentials = () => {
    let filtered = credentials;

    if (searchQuery) {
      filtered = filtered.filter(
        (cred) =>
          cred.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cred.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cred.website?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((cred) => cred.category === categoryFilter);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((cred) => cred.isFavorite);
    }

    setFilteredCredentials(filtered);
  };

  const handleSave = async () => {
    try {
      if (selectedCredential) {
        await CredentialService.updateCredential(
          selectedCredential.id,
          {
            ...formData,
            encryptedPassword: formData.password,
          },
          masterPassword
        );
        showSnackbar("Credential updated successfully");
      } else {
        await CredentialService.saveCredential(
          {
            ...formData,
            encryptedPassword: formData.password,
            tags: [],
          },
          masterPassword
        );
        showSnackbar("Credential saved successfully");
      }

      resetFormData(); // Clear the form data after saving
      setOpenDialog(false);
      loadCredentials();
    } catch (error) {
      console.error("Failed to save credential:", error);
      showSnackbar("Failed to save credential");
    }
  };

  const handleDelete = async (credentialId: string) => {
    if (window.confirm("Are you sure you want to delete this credential?")) {
      try {
        await CredentialService.deleteCredential(credentialId);
        showSnackbar("Credential deleted successfully");
        loadCredentials();
      } catch (error) {
        console.error("Failed to delete credential:", error);
        showSnackbar("Failed to delete credential");
      }
    }
  };

  const handleToggleFavorite = async (credential: Credential) => {
    try {
      await CredentialService.updateCredential(
        credential.id,
        {
          isFavorite: !credential.isFavorite,
        },
        masterPassword
      );
      loadCredentials();
    } catch (error) {
      console.error("Failed to update favorite:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: CredentialCategory.OTHER,
      username: "",
      password: "",
      website: "",
      notes: "",
      tags: [],
      isFavorite: false,
    });
    setSelectedCredential(null);
  };

  const resetFormData = () => {
    setFormData({
      title: "",
      category: CredentialCategory.OTHER,
      username: "",
      password: "",
      website: "",
      notes: "",
      tags: [],
      isFavorite: false,
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSnackbar(`${label} copied to clipboard`);
    } catch (error) {
      showSnackbar("Failed to copy to clipboard");
    }
  };

  const generatePassword = () => {
    const newPassword = EncryptionService.generatePassword(
      16,
      true,
      true,
      true,
      true
    );
    setFormData({ ...formData, password: newPassword });
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const editCredential = (credential: Credential) => {
    setSelectedCredential(credential);
    setFormData({
      title: credential.title,
      category: credential.category,
      username: credential.username,
      password: credential.encryptedPassword,
      website: credential.website || "",
      notes: credential.notes || "",
      tags: credential.tags,
      isFavorite: credential.isFavorite,
    });
    setOpenDialog(true);
    setAnchorEl(null);
  };

  const viewPasswordHistory = (credential: Credential) => {
    setSelectedCredential(credential);
    setOpenHistoryDialog(true);
    setAnchorEl(null);
  };

  const snoozeReminder = async (credentialId: string, days: number) => {
    try {
      await CredentialService.snoozePasswordReminder(credentialId, days);
      checkPasswordReminders();
      showSnackbar(`Reminder snoozed for ${days} days`);
    } catch (error) {
      showSnackbar("Failed to snooze reminder");
    }
  };

  const getCategoryColor = (category: CredentialCategory) => {
    const colors = {
      [CredentialCategory.BANKING]: "#4caf50",
      [CredentialCategory.EMAIL]: "#2196f3",
      [CredentialCategory.SOCIAL_MEDIA]: "#ff9800",
      [CredentialCategory.WORK]: "#9c27b0",
      [CredentialCategory.SHOPPING]: "#f44336",
      [CredentialCategory.ENTERTAINMENT]: "#e91e63",
      [CredentialCategory.GOVERNMENT]: "#607d8b",
      [CredentialCategory.HEALTH]: "#009688",
      [CredentialCategory.EDUCATION]: "#795548",
      [CredentialCategory.OTHER]: "#757575",
    };
    return colors[category] || "#757575";
  };

  const formatCategoryName = (category: CredentialCategory) => {
    return (
      category.charAt(0).toUpperCase() + category.slice(1).replace("_", " ")
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SecureVault
          </Typography>

          <Badge badgeContent={remindersCount} color="error">
            <IconButton
              color="inherit"
              onClick={() => setShowPasswordReminders(true)}
              title="Password change reminders"
            >
              <Warning />
            </IconButton>
          </Badge>

          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
        {/* Search and Filter Controls */}
        <Box mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search credentials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value as CredentialCategory)
                  }
                  startAdornment={<FilterList />}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {Object.values(CredentialCategory).map((category) => (
                    <MenuItem key={category} value={category}>
                      {formatCategoryName(category)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={3}>
              <Button
                fullWidth
                variant={showFavoritesOnly ? "contained" : "outlined"}
                startIcon={<Star />}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                Favorites
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Credentials Grid */}
        <Grid container spacing={3}>
          {filteredCredentials.map((credential) => (
            <Grid item xs={12} sm={6} md={4} key={credential.id}>
              <Card sx={{ position: "relative", "&:hover": { boxShadow: 4 } }}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="start"
                    mb={2}
                  >
                    <Typography variant="h6" component="div" noWrap>
                      {credential.title}
                    </Typography>

                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleFavorite(credential)}
                      >
                        {credential.isFavorite ? (
                          <Star color="primary" />
                        ) : (
                          <StarBorder />
                        )}
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedCredentialForMenu(credential);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>

                  <Chip
                    label={formatCategoryName(credential.category)}
                    size="small"
                    sx={{
                      mb: 2,
                      backgroundColor: getCategoryColor(credential.category),
                      color: "white",
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Username: {credential.username}
                  </Typography>

                  {credential.website && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Website: {credential.website}
                    </Typography>
                  )}

                  <Box
                    mt={2}
                    display="flex"
                    flexDirection={"column"}
                    alignItems={"flex-start"}
                    gap={1}
                  >
                    <Box>
                      Username
                      <IconButton
                        size="small"
                        onClick={() => {
                          copyToClipboard(credential.username, "Username");
                          CredentialService.markAsAccessed(credential.id);
                        }}
                        title="Copy username"
                      >
                        <ContentCopy />
                      </IconButton>
                    </Box>
                    <Box>
                      password
                      <IconButton
                        size="small"
                        onClick={() => {
                          copyToClipboard(
                            credential.encryptedPassword,
                            "Password"
                          );
                          CredentialService.markAsAccessed(credential.id);
                        }}
                        title="Copy password"
                      >
                        <ContentCopy />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredCredentials.length === 0 && (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6" color="text.secondary">
              No credentials found
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {credentials.length === 0
                ? "Add your first credential to get started"
                : "Try adjusting your search or filters"}
            </Typography>
          </Box>
        )}
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => {
          resetFormData();
          setOpenDialog(true);
        }}
      >
        <Add />
      </Fab>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => editCredential(selectedCredentialForMenu!)}>
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => viewPasswordHistory(selectedCredentialForMenu!)}
        >
          <ListItemIcon>
            <History />
          </ListItemIcon>
          <ListItemText>Password History</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleDelete(selectedCredentialForMenu!.id)}>
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedCredential ? "Edit Credential" : "Add New Credential"}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as CredentialCategory,
                })
              }
            >
              {Object.values(CredentialCategory).map((category) => (
                <MenuItem key={category} value={category}>
                  {formatCategoryName(category)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Username/Email"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            margin="normal"
          />

          <Box display="flex" gap={1} alignItems="flex-end">
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              onClick={generatePassword}
              variant="outlined"
              sx={{ mb: 1 }}
            >
              Generate
            </Button>
          </Box>

          <TextField
            fullWidth
            label="Website"
            value={formData.website}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            margin="normal"
          />

          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            margin="normal"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedCredential ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password History Dialog */}
      <Dialog
        open={openHistoryDialog}
        onClose={() => setOpenHistoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Password History - {selectedCredential?.title}
        </DialogTitle>
        <DialogContent>
          {selectedCredential?.passwordHistory.length === 0 ? (
            <Typography>No password history available</Typography>
          ) : (
            selectedCredential?.passwordHistory.map((history, index) => (
              <Box
                key={history.id}
                mb={2}
                p={2}
                bgcolor="grey.50"
                borderRadius={1}
              >
                <Typography variant="subtitle2">
                  Password {index + 1} (Changed:{" "}
                  {history.createdAt.toLocaleDateString()})
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {"*".repeat(history.encryptedPassword.length)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      copyToClipboard(history.encryptedPassword, "Old password")
                    }
                  >
                    <ContentCopy />
                  </IconButton>
                </Box>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Password Reminders Dialog */}
      <Dialog
        open={showPasswordReminders}
        onClose={() => setShowPasswordReminders(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Password Change Reminders</DialogTitle>
        <DialogContent>
          {passwordReminders.length === 0 ? (
            <Typography>No password change reminders</Typography>
          ) : (
            passwordReminders.map((credential) => (
              <Alert
                key={credential.id}
                severity="warning"
                sx={{ mb: 2 }}
                action={
                  <Box>
                    <Button
                      size="small"
                      onClick={() => snoozeReminder(credential.id, 7)}
                    >
                      Snooze 7d
                    </Button>
                    <Button
                      size="small"
                      onClick={() => editCredential(credential)}
                    >
                      Update
                    </Button>
                  </Box>
                }
              >
                <strong>{credential.title}</strong> - Password unchanged since{" "}
                {credential.lastPasswordChange.toLocaleDateString()}
              </Alert>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordReminders(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};
