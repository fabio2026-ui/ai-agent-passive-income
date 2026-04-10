# YouTube Video Script: SOC 2 Audit Prep - 90-Day Sprint
**Topic:** Fast-Track SOC 2 Preparation
**Duration:** 8-10 minutes
**Target Audience:** Startups under time pressure, compliance leads

---

## 🎬 INTRO HOOK (0:00 - 0:40)

*[Urgent tone, ticking clock sound effect]*

**HOST:**
"Three months. That's all you've got.

Your biggest prospect just made SOC 2 a deal-breaker. Your board is asking questions. Your competitors all have it. And you're starting from zero.

Can you get SOC 2 compliant in 90 days? Yes. I've seen it done. But it requires focus, the right strategy, and zero wasted effort.

In this video, I'm giving you the exact 90-day sprint plan I use with companies under time pressure. No fluff, no nice-to-haves—just the critical path to your SOC 2 Type I.

Clock's ticking. Let's go."

---

## 📋 CONTENT STRUCTURE

### Section 1: The 90-Day Sprint Overview (0:40 - 1:30)

**The Reality Check:**
- Standard SOC 2 timeline: 6-12 months
- Compressed timeline: 90 days
- What you're trading: Depth for speed
- What's non-negotiable: Core controls must be real

**The 3-Phase Sprint:**

**Days 1-30: Foundation & Fast Fixes**
- Quick wins that close major gaps
- Essential policy documentation
- Core tool deployment

**Days 31-60: Control Implementation**
- System configuration
- Process establishment
- Evidence generation

**Days 61-90: Audit Prep & Execution**
- Evidence review
- Auditor selection
- Audit execution

**Prerequisites (Must Have Before Starting):**
- Executive commitment and budget approval
- Designated compliance owner (dedicated time)
- Basic security hygiene (MFA, backups)
- No major security incidents pending

### Section 2: Days 1-30: Foundation Sprint (1:30 - 3:30)

**Week 1: Emergency Triage**

**Day 1-2: Risk Assessment Blitz**
- Use AICPA's risk assessment template
- Identify your highest-risk areas
- Prioritize by audit likelihood + business impact

**Day 3-5: Tool Procurement**
- Compliance platform: Vanta or Drata (fastest setup)
- Background check service: Checkr or GoodHire
- Training platform: KnowBe4 or Proofpoint
- Pen test vendor: Secure pre-audit slot NOW

**Critical Purchase:**
- Penetration testing (6-8 week lead time)
- Schedule it immediately or you'll miss your window

**Week 2: Policy Factory**

**Template Strategy:**
Don't write from scratch. Customize proven templates:

1. Information Security Policy (master policy)
2. Access Control Policy
3. Change Management Policy
4. Incident Response Plan
5. Vendor Management Policy
6. Acceptable Use Policy

**Policy Best Practices:**
- Keep them concise (3-5 pages each)
- Include approval signatures
- Date and version control everything
- Make them realistic for your size

**Week 3: Quick Win Controls**

**Immediate Actions (Day 15-21):**

| Control | Implementation | Evidence |
|---------|----------------|----------|
| MFA | Enforce on all systems | Admin console screenshot |
| Access Reviews | Quarterly calendar invite | Calendar + process doc |
| Backups | Enable + test restore | Backup logs + test results |
| Encryption | Verify at-rest + in-transit | Configuration screenshots |
| Offboarding | Document the process | Written procedure + ticket example |

**Week 4: Process Documentation**

**Document These Workflows:**
- Employee onboarding (access provisioning)
- Employee offboarding (access removal)
- System change management
- Incident response (escalation path)
- Vendor onboarding assessment

**Pro Tip:**
Use screen recordings (Loom) to document processes—faster than writing and auditors love them.

### Section 3: Days 31-60: Control Deep Dive (3:30 - 5:30)

**Week 5-6: Access Control Implementation**

**Identity & Access Management:**

**Immediate Actions:**
1. Inventory all user accounts
2. Remove orphaned accounts
3. Implement role-based access
4. Enable privileged access monitoring
5. Document access review process

**Evidence to Gather:**
- User access list exports (before/after)
- Role definition document
- Access review meeting notes
- Privileged access log samples

**Week 7: Change Management Setup**

**Minimum Viable Process:**

```
Change Request → Approval → Implementation → Testing → Documentation
```

**Tools:**
- Jira/Asana for tracking
- GitHub/GitLab for code changes
- PagerDuty/Opsgenie for approvals

**Evidence:**
- Sample change tickets (3-5 examples)
- Approval workflow screenshots
- Testing documentation

**Week 8: Monitoring & Logging**

**Minimum Requirements:**

1. **System Logging**
   - CloudTrail (AWS) / Audit Logs (GCP/Azure)
   - Application logs
   - Authentication logs

2. **Alerting Setup**
   - Failed login attempts
   - Privileged access usage
   - Configuration changes
   - Suspicious API calls

3. **Log Retention**
   - Minimum 1 year
   - Immutable storage
   - Access controls

**Evidence:**
- Log configuration screenshots
- Sample log entries
- Alert configuration
- Retention policy documentation

### Section 4: Days 61-90: Audit Execution (5:30 - 7:30)

**Week 9: Evidence Sprint**

**Evidence Collection Blitz:**

Create an evidence folder with these categories:

```
/AC - Access Control
/CC - Change Control
/CO - Communication
/MO - Monitoring
/HR - Human Resources
/IS - Information Security
/SY - System Operations
/VM - Vendor Management
```

**Evidence Checklist (Minimum 3-5 samples each):**

- [ ] User access provisioning tickets
- [ ] User access termination tickets
- [ ] Access review documentation
- [ ] Change management tickets
- [ ] Security awareness training completion
- [ ] Background check confirmations
- [ ] Vendor security assessments
- [ ] Incident tickets (if any)
- [ ] Backup logs/test results
- [ ] Penetration test report
- [ ] System configuration screenshots

**Week 10: Auditor Engagement**

**Selecting Your Auditor (Fast Track):**

**Questions to ask:**
1. "Can you complete a Type I in 2-3 weeks?"
2. "Do you have availability in [target month]?"
3. "What's your fastest engagement timeline?"
4. "Can we do a pre-audit review?"

**Recommended Fast-Track Auditors:**
- A-LIGN (specializes in startup speed)
- Prescient Assurance
- Johanson Group
- Redpath (if bundling with ISO 27001)

**Pre-Audit Preparation:**
- Submit evidence package 1 week before
- Schedule all interviews
- Prepare system access for auditors
- Brief your team on the process

**Week 11-12: The Audit**

**Audit Week Agenda:**

**Day 1:**
- Opening meeting (30 min)
- Policy review
- Evidence walkthrough

**Day 2:**
- System demonstrations
- Personnel interviews
- Sample testing

**Day 3:**
- Follow-up questions
- Additional evidence requests
- Preliminary findings review

**Day 4-5:**
- Draft report preparation
- Final review
- Report issuance (2-3 weeks later)

**Survival Tips:**
- Designate one point of contact
- Have evidence organized and accessible
- Don't volunteer extra information
- It's okay to say "I'll get back to you on that"

### Section 5: Post-Audit & Maintenance (7:30 - 8:30)

**You Passed! Now What?**

**Immediate Actions:**
1. Share report with sales team
2. Add SOC 2 badge to website/security page
3. Update security questionnaire responses
4. Celebrate with your team!

**Ongoing Compliance (Critical):**

**Monthly:**
- Access reviews
- Security metrics review
- Control testing

**Quarterly:**
- Policy reviews
- Risk assessments
- Security awareness training
- Vendor assessments

**Annually:**
- Full audit (Type I or II)
- Penetration testing
- Business continuity testing
- Policy updates

**Planning for Type II:**
- Start 3-month observation period immediately
- Document control operation daily
- Gather continuous evidence
- Consider Type II audit in 6 months

---

## 🎯 CTA / OUTRO (8:30 - 10:00)

**HOST:**
"Ninety days. That's all it took. You're now SOC 2 compliant, your deals are closing, and your board is impressed.

But here's the thing—compliance isn't a finish line, it's a baseline. The real value comes from the security culture you build, the processes you establish, and the trust you earn from your customers.

If you're in that 90-day sprint right now, I've got something that will save you hours: **The SOC 2 Sprint Playbook**—my complete project plan with weekly task lists, templates, and vendor recommendations. It's everything I just covered, but organized for execution.

**Grab it in the description.**

Your next steps:
1. **Download the Sprint Playbook** and start Day 1 today
2. **Join our Slack community**—connect with founders going through the same journey
3. **Subscribe** for more compliance deep-dives—we're covering ISO 27001 next
4. **Comment 'Sprint'** if you're in the middle of your 90-day journey

Time is your most valuable asset. Don't waste it on compliance guesswork.

Now stop watching videos and start executing. Your audit date isn't going to move itself."

*[End screen with playbook download and subscribe button]*

---

## 📝 SPRINT RESOURCES

**90-Day Timeline Visual:**
```
Month 1          Month 2          Month 3
[████████░░]    [████████████]    [████████████]
Foundation      Implementation    Audit & Launch

Key Milestones:
Week 2: Policies drafted
Week 4: Quick wins complete
Week 6: Controls operational
Week 8: Evidence 80% complete
Week 10: Audit starts
Week 12: Report issued
```

**Vendor Fast-Track Contacts:**
- Compliance: Vanta (setup in 24 hours)
- Pen Testing: Bishop Fox, NCC Group
- Auditors: A-LIGN, Prescient Assurance
- Training: KnowBe4 (instant deployment)

**Warning Signs You're Off Track:**
- Policies still being written in Week 8
- No pen test scheduled by Week 4
- Evidence collection hasn't started by Week 7
- Team doesn't know what SOC 2 is by Week 2

**Emergency Escalation Options:**
- Hire fractional CISO consultant
- Engage compliance project manager
- Consider readiness assessment first
- Push timeline if critical gaps remain
