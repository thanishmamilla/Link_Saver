import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';

function getSummaryText(summary) {
  // Try to parse as JSON (error from Jina)
  try {
    const parsed = JSON.parse(summary);
    if (parsed.readableMessage) return parsed.readableMessage;
    summary = parsed;
  } catch {
    // summary is plain text
  }
  if (typeof summary === 'string') {
    // Remove markdown, HTML, and navigation-like lines
    const lines = summary
      .split('\n')
      .map(line => line.trim())
      .filter(line =>
        line.length > 30 &&
        !/^[-=*#]/.test(line) && // skip markdown headers/lists
        !/^(Back|Skip navigation|Search|NaN|YouTube|Home)$/i.test(line)
      );
    if (lines.length > 0) return lines[0];
    // fallback: first 200 chars
    if (summary && summary.length > 0)
      return summary.slice(0, 200) + (summary.length > 200 ? '...' : '');
    return 'Summary temporarily unavailable.';
  }
  return 'Summary temporarily unavailable.';
}

function Bookmarks({ token }) {
  const [url, setUrl] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) fetchBookmarks();
    // eslint-disable-next-line
  }, [token]);

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bookmarks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(res.data);
    } catch (err) {
      setError('Failed to load bookmarks');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/bookmarks', { url }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks([res.data, ...bookmarks]);
      setUrl('');
    } catch (err) {
      setError('Failed to add bookmark');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/bookmarks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(bookmarks.filter(b => b._id !== id));
    } catch {
      setError('Failed to delete');
    }
  };

  if (!token) return <Alert severity="error">Please login to view your bookmarks.</Alert>;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="90vh" width="100vw" sx={{ background: 'transparent' }}>
      <Card sx={{ minWidth: 400, maxWidth: 600, width: '100%', boxShadow: 6, m: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>Bookmarks</Typography>
          <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField label="Paste URL" type="url" value={url} onChange={e => setUrl(e.target.value)} required fullWidth autoFocus />
            <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ minWidth: 120 }}>
              {loading ? 'Saving...' : 'Add'}
            </Button>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <List>
            {bookmarks.map(b => (
              <ListItem key={b._id} alignItems="flex-start" sx={{ mb: 2, borderBottom: '1px solid #333' }}>
                <ListItemAvatar>
                  <Avatar src={b.favicon || undefined} alt="favicon">
                    {b.title?.[0] || '🔗'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{b.title}</Typography>
                    <IconButton href={b.url} target="_blank" rel="noopener noreferrer" size="small" color="primary">
                      <LinkIcon />
                    </IconButton>
                  </>}
                  secondary={<pre style={{ margin: 0, background: 'none', color: '#b3e5fc', fontSize: '1rem', whiteSpace: 'pre-wrap', padding: 0 }}>{getSummaryText(b.summary)}</pre>}
                />
                <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleDelete(b._id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Bookmarks; 