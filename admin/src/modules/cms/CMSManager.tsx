import React, { useState } from 'react';
import { Box, Tab, Tabs, TextField, Button, Grid, Card, CardContent, Typography, IconButton } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import { CloudUpload as UploadIcon, Delete as DeleteIcon } from '@mui/icons-material';

export const CMSManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // FAQs State
  const [faqs, setFaqs] = useState([
    { question: 'How do I schedule a scrap collection?', answer: 'Navigate to the bookings section in your app, select scrap collection, choose a time slot, and confirm.' },
    { question: 'What payment modes are supported?', answer: 'We accept Razorpay digital payments (UPI, Card, Net Banking) and Cash on Delivery.' },
  ]);

  // Version notes
  const [versionNotes, setVersionNotes] = useState('v1.4.2\n- Added native Google Sign-in\n- Optimised OTP login verification\n- Fixed gesture handler crash on startup');

  // Policy pages state
  const [policy, setPolicy] = useState('This is the official Privacy Policy and Terms of Use for Urban Power.');

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    setFaqs((prev) =>
      prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq))
    );
  };

  const handleDeleteFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveCMS = () => {
    alert('CMS modifications updated successfully!');
  };

  return (
    <Box>
      <PageHeader title="Content Management System" subtitle="Configure banners, FAQ directories, legal declarations, and version notes." />

      <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
        <Tab label="Banners & Carousels" />
        <Tab label="FAQs" />
        <Tab label="Legal & Policies" />
        <Tab label="App Version Notes" />
      </Tabs>

      {activeTab === 0 && (
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: '"Outfit", sans-serif' }}>
              Home Banner & App Carousels
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ border: '2px dashed #E2E8F0', borderRadius: 3, p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <UploadIcon sx={{ fontSize: 48, color: '#A0AEC0', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload Home Promo Banner Image (PNG/JPEG format, max 2MB)
                  </Typography>
                  <Button variant="outlined" component="label" sx={{ alignSelf: 'center' }}>
                    Select File
                    <input type="file" hidden />
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ border: '2px dashed #E2E8F0', borderRadius: 3, p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <UploadIcon sx={{ fontSize: 48, color: '#A0AEC0', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload Carousel Images (Resolutions: 1080x450)
                  </Typography>
                  <Button variant="outlined" component="label" sx={{ alignSelf: 'center' }}>
                    Select Files
                    <input type="file" multiple hidden />
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSaveCMS}>Save Changes</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
                Manage Frequently Asked Questions (FAQs)
              </Typography>
              <Button variant="outlined" onClick={handleAddFaq}>Add FAQ Row</Button>
            </Box>

            {faqs.map((faq, index) => (
              <Box key={index} sx={{ mb: 3, p: 2.5, border: '1px solid #E2E8F0', borderRadius: 2.5, position: 'relative' }}>
                <IconButton
                  onClick={() => handleDeleteFaq(index)}
                  sx={{ position: 'absolute', top: 12, right: 12 }}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
                <Grid container spacing={2}>
                  <Grid item xs={11}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Question"
                      value={faq.question}
                      onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      label="Answer"
                      value={faq.answer}
                      onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="contained" onClick={handleSaveCMS}>Save FAQ Directory</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: '"Outfit", sans-serif' }}>
              App Policies & Terms of Use
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              value={policy}
              onChange={(e) => setPolicy(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSaveCMS}>Update Terms & Policy</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: '"Outfit", sans-serif' }}>
              App Release & Version Notes
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSaveCMS}>Publish Version Notes</Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CMSManager;
