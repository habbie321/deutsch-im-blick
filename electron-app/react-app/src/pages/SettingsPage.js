import { Box, Chip, Container, FormControl, FormControlLabel, InputLabel, MenuItem, Paper, Select, Switch, TextField, Typography } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import PaletteIcon from '@mui/icons-material/Palette';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SchoolIcon from '@mui/icons-material/School';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import { AI_PROVIDERS } from '../utils/aiContracts';
import { useAiSettings } from '../utils/aiSettings';

const SettingsPage = () => {
  const { id } = useParams();
  const { aiEnabled, provider, model, baseUrl, enableRemote, hasApiKey, loaded, setAiEnabled, updateSettings } =
    useAiSettings();

  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [modelDraft, setModelDraft] = useState('');
  const [baseUrlDraft, setBaseUrlDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setApiKeyDraft('');
  }, [hasApiKey, loaded]);

  useEffect(() => {
    if (loaded) {
      setModelDraft(model);
      setBaseUrlDraft(baseUrl);
    }
  }, [loaded, model, baseUrl]);

  const placeholderItems = [
    { icon: <PaletteIcon fontSize="small" />, title: 'Theme & appearance', desc: 'Light/dark mode, font sizing, and layout density.' },
    { icon: <VolumeUpIcon fontSize="small" />, title: 'Media preferences', desc: 'Video autoplay, captions, and playback behavior.' },
    { icon: <SchoolIcon fontSize="small" />, title: 'Learning defaults', desc: 'Preferred chapter, reminders, and progress behaviors.' }
  ];

  const saveProviderSettings = async (patch) => {
    setSaving(true);
    try {
      await updateSettings(patch);
    } finally {
      setSaving(false);
    }
  };

  const handleApiKeyBlur = async () => {
    if (!apiKeyDraft.trim()) return;
    await saveProviderSettings({ apiKey: apiKeyDraft.trim() });
    setApiKeyDraft('');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Settings
            </Typography>
            <Chip icon={<TuneIcon />} label={`Account ${id}`} variant="outlined" />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Configure learning and assistant preferences for this account.
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2.5, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <SmartToyIcon fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              AI assistant
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            When off, the assistant panel stays available but chat and answer checking will not call any AI service.
            Provider settings are stored locally on this device (Electron userData).
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Privacy: student answers are sent to the configured model only when they use Check my answer or chat.
            The app logs request metadata (provider, activity, duration) in the main process — not message text.
            Use Local provider to keep all model calls on this computer; disable remote calls when offline.
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                disabled={!loaded || saving}
              />
            }
            label={aiEnabled ? 'AI assistant enabled' : 'AI assistant disabled'}
            sx={{ display: 'block', mb: 2 }}
          />

          <Box sx={{ display: 'grid', gap: 2 }}>
            <FormControl fullWidth size="small" disabled={!loaded || saving}>
              <InputLabel id="ai-provider-label">Provider</InputLabel>
              <Select
                labelId="ai-provider-label"
                label="Provider"
                value={provider}
                onChange={(e) => saveProviderSettings({ provider: e.target.value })}
              >
                {AI_PROVIDERS.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Model"
              size="small"
              value={modelDraft}
              onChange={(e) => setModelDraft(e.target.value)}
              onBlur={() => {
                if (modelDraft !== model) saveProviderSettings({ model: modelDraft });
              }}
              disabled={!loaded || saving}
              placeholder={provider === 'mock' ? 'mock (default)' : provider === 'local' ? 'e.g. llama3.2' : 'e.g. gpt-4o-mini'}
              helperText={
                provider === 'mock'
                  ? 'Mock provider uses heuristics only.'
                  : provider === 'local'
                    ? 'Ollama model name (pull with: ollama pull llama3.2).'
                    : 'OpenAI-compatible model name for your remote API.'
              }
            />

            <TextField
              label="Base URL"
              size="small"
              value={baseUrlDraft}
              onChange={(e) => setBaseUrlDraft(e.target.value)}
              onBlur={() => {
                if (baseUrlDraft !== baseUrl) saveProviderSettings({ baseUrl: baseUrlDraft });
              }}
              disabled={!loaded || saving || provider === 'mock'}
              placeholder="http://localhost:11434"
              helperText="Ollama server URL (default http://localhost:11434)."
            />

            <TextField
              label="API key"
              size="small"
              type="password"
              value={apiKeyDraft}
              onChange={(e) => setApiKeyDraft(e.target.value)}
              onBlur={handleApiKeyBlur}
              disabled={!loaded || saving || provider !== 'remote'}
              placeholder={hasApiKey ? '•••••• (saved — type to replace)' : 'Required for remote provider'}
              helperText="Never logged in the renderer. Stored only in the main process."
            />

            <FormControlLabel
              control={
                <Switch
                  checked={enableRemote}
                  onChange={(e) => saveProviderSettings({ enableRemote: e.target.checked })}
                  disabled={!loaded || saving || provider !== 'remote'}
                />
              }
              label="Allow remote model calls"
            />
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {placeholderItems.map((item) => (
            <Paper key={item.title} sx={{ p: 2, borderRadius: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                {item.icon}
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {item.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {item.desc}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Box sx={{ mt: 2 }}>
          <BackButton to={`/account/${id}`} />
        </Box>
      </Container>
    </Box>
  );
};

export default SettingsPage;
