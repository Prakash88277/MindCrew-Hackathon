# Demo Script - Symptom Logger

## Pre-Demo Setup (5 minutes)

1. **Open the application** in browser
2. **Ensure demo data is loaded** (run seed script if needed)
3. **Have demo scenarios ready** in separate tabs
4. **Prepare sample user accounts** (guest and registered)

## Demo Flow (10-15 minutes)

### 1. Introduction (2 minutes)

**"Welcome to Symptom Logger - an AI-powered medical symptom assessment application."**

**Key Points:**
- "This is a prototype for demonstration purposes only"
- "It does not provide medical advice - always consult healthcare professionals"
- "The app uses explainable AI with rule-based reasoning"
- "Full transparency in decision-making process"

**Show:**
- Landing page with disclaimer
- Clean, professional UI
- Clear navigation

### 2. User Authentication (1 minute)

**"Let's start by logging in as a guest user."**

**Actions:**
- Click "Continue as Guest"
- Show consent dialog
- Accept consent
- Land on dashboard

**Highlight:**
- Quick guest access
- Consent management
- User-friendly flow

### 3. Symptom Logging - Demo Scenario 1: Mild Cold (3 minutes)

**"Let's log some mild cold symptoms to see how the system works."**

**Actions:**
1. Click "Log New Symptoms"
2. Search for "cough" → select it
3. Set severity to 1/5
4. Search for "sore throat" → select it
5. Set severity to 1/5
6. Set duration to 1 day
7. Toggle "Suggest additional symptoms"
8. Show suggested symptoms (fever, fatigue)
9. Add temperature: 36.5°C
10. Add notes: "Started yesterday with dry cough"
11. Submit

**Highlight:**
- Intuitive symptom search
- Severity sliders
- Smart suggestions
- Optional vital signs
- Clean form design

### 4. Results Display - Mild Cold (2 minutes)

**"Now let's see what the AI recommends."**

**Show:**
- Self-care recommendation card
- "How We Decided" section
- Rule trace showing:
  - Rule: "Mild upper respiratory"
  - Matched facts: cough(1), sore_throat(1)
  - Confidence: 85%
- Suggested additional symptoms
- Export CSV option

**Highlight:**
- Clear, actionable recommendations
- Full explainability
- Professional presentation
- Export functionality

### 5. Demo Scenario 2: High Fever with Comorbidity (3 minutes)

**"Let's try a more serious case - someone with diabetes and high fever."**

**Actions:**
1. Go back to "Log New Symptoms"
2. Search for "fever" → select it
3. Set severity to 3/5
4. Search for "headache" → select it
5. Set severity to 2/5
6. Set duration to 3 days
7. Enable "diabetes" comorbidity
8. Add temperature: 39.0°C
9. Add notes: "High fever for 3 days, diabetic patient"
10. Submit

**Show:**
- "See Your Doctor" recommendation
- Rule trace showing:
  - Rule: "High persistent fever"
  - Rule: "Comorbidity - diabetes escalator"
  - Escalation due to diabetes
- Confidence scores
- Multiple rules fired

**Highlight:**
- Comorbidity consideration
- Escalation logic
- Multiple rule interactions
- Risk stratification

### 6. Demo Scenario 3: Emergency Case (2 minutes)

**"Now let's see how the system handles an emergency situation."**

**Actions:**
1. Use "Run Demo" button for "Emergency Case"
2. Or manually log:
   - Chest pain severity 4
   - Shortness of breath severity 3
   - Duration: 0 days

**Show:**
- **BIG RED EMERGENCY BANNER**
- "Call 911 Now" button
- Immediate emergency recommendation
- Red-flag rule triggered
- Short-circuit logic (no other rules evaluated)

**Highlight:**
- Safety-first approach
- Clear emergency indicators
- Immediate action required
- Red-flag detection

### 7. History and Tracking (2 minutes)

**"Let's look at the user's symptom history."**

**Actions:**
1. Navigate to "History"
2. Show timeline of all logs
3. Expand one log to show details
4. Show export functionality

**Highlight:**
- Complete history tracking
- Detailed log information
- Export capabilities
- Timeline view

### 8. Admin Panel - Rule Management (3 minutes)

**"Now let's look at the admin interface for managing the AI rules."**

**Actions:**
1. Navigate to "Admin"
2. Show list of rules
3. Toggle a rule on/off
4. Edit a rule (show JSON editor)
5. Test a rule with sample payload
6. Show test results

**Highlight:**
- Full rule management
- Real-time testing
- JSON-based rule editing
- Admin controls

### 9. Architecture and Technical Highlights (2 minutes)

**"Let me show you the technical architecture."**

**Show:**
- Rule engine explanation
- Explainable AI concept
- Data flow diagram
- Security features
- Scalability considerations

**Key Technical Points:**
- Rules-based reasoning (not black box)
- Full transparency in decisions
- Configurable rule system
- Real-time evaluation
- Comprehensive logging

## Q&A Preparation

### Common Questions & Answers

**Q: "Is this actually providing medical advice?"**
A: "No, this is a prototype for demonstration. It provides structured suggestions based on rules, but always recommends consulting healthcare professionals. The disclaimer is prominently displayed."

**Q: "How accurate is the AI?"**
A: "The system uses conservative, safety-first rules developed with medical guidance. It's designed to err on the side of caution, especially for emergency situations."

**Q: "Can the rules be customized?"**
A: "Yes, the admin panel allows full rule management. Rules can be added, modified, activated/deactivated, and tested in real-time."

**Q: "What about data privacy?"**
A: "The system includes consent management, data encryption, and user control over their data. It's designed with privacy-first principles."

**Q: "How does this scale?"**
A: "The architecture supports horizontal scaling, uses efficient database queries, and can handle high concurrent loads. The rule engine is stateless and fast."

**Q: "What's the business model?"**
A: "This is a hackathon prototype. In production, it could be licensed to healthcare providers, integrated into existing systems, or used as a patient engagement tool."

## Demo Tips

### Before the Demo
- [ ] Test all scenarios beforehand
- [ ] Have backup plans for technical issues
- [ ] Prepare sample data
- [ ] Check internet connection
- [ ] Have demo script printed/visible

### During the Demo
- [ ] Speak clearly and confidently
- [ ] Explain what you're doing as you do it
- [ ] Highlight key features
- [ ] Show the "wow" moments
- [ ] Keep to time limits
- [ ] Engage the audience

### After the Demo
- [ ] Be ready for questions
- [ ] Have technical details ready
- [ ] Discuss next steps
- [ ] Collect feedback
- [ ] Share contact information

## Troubleshooting

### If Something Goes Wrong
1. **App won't load**: Check internet, try refresh
2. **Login fails**: Use guest mode
3. **Rules don't work**: Check if database is seeded
4. **Slow performance**: Explain it's a demo environment
5. **Missing data**: Run seed script

### Backup Plans
- Have screenshots ready
- Prepare video recording
- Have local demo environment
- Use mobile hotspot if needed

## Success Metrics

### What Judges Will Look For
- [ ] **Functionality**: Everything works end-to-end
- [ ] **Innovation**: Novel approach to symptom assessment
- [ ] **Technical Excellence**: Clean code, good architecture
- [ ] **User Experience**: Intuitive, professional interface
- [ ] **Explainability**: Clear reasoning and transparency
- [ ] **Safety**: Conservative, medical-appropriate suggestions
- [ ] **Scalability**: Can handle real-world usage
- [ ] **Presentation**: Clear, engaging demo

### Key Differentiators
1. **Explainable AI**: Not a black box
2. **Safety First**: Conservative, medical-appropriate
3. **Full Transparency**: Every decision is traceable
4. **Admin Control**: Rules can be managed and tested
5. **Professional UI**: Clean, medical-grade interface
6. **Comprehensive**: Complete symptom-to-recommendation flow

## Closing

**"Symptom Logger demonstrates how AI can be used responsibly in healthcare - with full transparency, safety-first design, and explainable decision-making. Thank you for your attention. Any questions?"**
