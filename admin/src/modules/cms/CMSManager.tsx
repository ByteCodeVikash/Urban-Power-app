import React, { useState } from 'react';
import { Box, Tab, Tabs, TextField, Button, Grid, Card, CardContent, Typography, IconButton, Alert } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import { CloudUpload as UploadIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';

export const CMSManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // FAQs State
  const [faqs, setFaqs] = useState([
    { question: 'How do I schedule a scrap collection?', answer: 'Navigate to the bookings section in your app, select scrap collection, choose a time slot, and confirm.' },
    { question: 'What payment modes are supported?', answer: 'We accept Razorpay digital payments (UPI, Card, Net Banking) and Cash on Delivery.' },
    { question: 'How can I verify the assigned technician?', answer: 'Technician details, photo, and electrical license ID are displayed in the active order tracking screen for safety.' },
  ]);

  // About & Contact Info State
  const [aboutUs, setAboutUs] = useState('Urban Power is India\'s premier enterprise household maintenance and recycling aggregator. We connect skilled electrical technicians and scrap dealers directly to your doorstep.');
  const [contactEmail, setContactEmail] = useState('support@urbanpower.in');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [officeAddress, setOfficeAddress] = useState('Sector 62, Noida, Uttar Pradesh, 201301');
  const [gstin, setGstin] = useState('09AAFCU8742M1ZP');

  // Policy pages state
  const [privacyPolicy, setPrivacyPolicy] = useState('Your privacy is critical to us. Urban Power collects device locations, contact details, and transaction history solely to verify electrical service completions and coordinate secure scrap collections.');
  const [termsOfUse, setTermsOfUse] = useState('By using the Urban Power application, you agree that all scrap measurements verified by our automated scales are final. Technicians reserve the right to cancel bookings if safety parameters are breached.');

  // Version notes
  const [versionNotes, setVersionNotes] = useState('v1.4.2\n- Added native Google Sign-in\n- Optimised OTP login verification\n- Fixed gesture handler crash on startup\n- Added live tracking maps for assigned technicians');

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

  const handleSaveCMS = (sectionName: string) => {
    setAlertMsg(`${sectionName} modifications updated successfully!`);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <Box>
      <PageHeader title="Content Management System" subtitle="Configure banners, FAQ directories, legal declarations, and version notes." />

      {showAlert && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {alertMsg}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
        <Tab label="Banners & Carousels" />
        <Tab label="About & Contact Info" />
        <Tab label="FAQs" />
        <Tab label="Legal & Policies" />
        <Tab label="App Version Notes" />
      </Tabs>

      {/* Banners & Carousels */}
      {activeTab === 0 && (
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: '"Outfit", sans-serif' }}>
              Home Banner & App Carousels
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
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
              <Button variant="contained" onClick={() => handleSaveCMS('Banners & Carousels')}>Save Changes</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* About & Contact Info */}
      {activeTab === 1 && (
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, fontFamily: '"Outfit", sans-serif' }}>
              Company Profile & Customer Care Touchpoints
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="About Us / Corporate Pitch"
                  value={aboutUs}
                  onChange={(e) => setAboutUs(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Customer Support Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Customer Support Hotline"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Registered Headquarters Address"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="GSTIN Number"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSaveCMS('About & Contact')}>
                Update Corporate Roster
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* FAQs */}
      {activeTab === 2 && (
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
                  <Grid size={{ xs: 11 }}>
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
              <Button variant="contained" onClick={() => handleSaveCMS('FAQs')}>Save FAQ Directory</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Legal & Policies */}
      {activeTab === 3 && (
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: 'none' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, fontFamily: '"Outfit", sans-serif' }}>
              App Policies & Terms of Use
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label="Privacy Policy"
                  value={privacyPolicy}
                  onChange={(e) => setPrivacyPolicy(e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label="Terms of Service / Agreement Declarations"
                  value={termsOfUse}
                  onChange={(e) => setTermsOfUse(e.target.value)}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSaveCMS('Legal Policies')}>
                Update Terms & Policies
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* App Version Notes */}
      {activeTab === 4 && (
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
              <Button variant="contained" onClick={() => handleSaveCMS('Version Notes')}>Publish Version Notes</Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CMSManager;
