export const mockCaseStream = `{"id":"44c6cd75-b7c4-4e27-b643-ab14c15ee3a0","title":"知识产权案例（已更新）","description":"这是一个更新后的知识产权侵权案例描述","profileId":"profile-123","clientId":null,"status":"ANALYZING","startDate":null,"endDate":null,"clientName":null,"profileName":null,"createdAt":"2025-05-19T09:34:05","updatedAt":"2025-05-19T09:34:49","documents":[{"id":"dee273b2-1bf7-4e16-a1df-33b6b03fddb0","title":"P60 2020.pdf","description":"Uploaded document","filePath":"http://127.0.0.1:8080/api/storage/v1/files/blob/ef89145a-fcc6-46d3-8368-05559f2386ef.pdf","fileType":"application/pdf","fileSize":747482,"storageId":"4cbe6be7-d8a2-4f4f-82c7-657cc3766674","caseId":"44c6cd75-b7c4-4e27-b643-ab14c15ee3a0","documentType":"P60","downloadUrl":null,"metadataJson":"{\\"tax_year_end\\": \\"Tax year to 5 April 2020\\", \\"document_type\\": \\"P60 End of Year Certificate\\", \\"employee_details\\": {\\"surname\\": \\"ROCHA\\", \\"forenames_or_initials\\": \\"LUCAS CAVALCANTI\\", \\"national_insurance_number\\": \\"SS 47 21 88 A\\"}, \\"employee_instructions\\": {\\"purpose\\": \\"Please keep this certificate in a safe place as you will need it if you have to fill in a tax return. You also also need it to to make a claim for tax credits and Universal Credit or to renew your claim.\\", \\"legal_requirement\\": \\"By law you are required to tell HM Revenue and Customs about any income that is not fully taxed, even if you are not sent a tax return.\\"}, \\"pay_and_income_tax_details\\": {\\"pay\\": {\\"total_for_year\\": \\"40187 04\\", \\"current_employment\\": \\"40187 04\\", \\"previous_employment\\": \\"0 00\\"}, \\"income_tax\\": {\\"total_for_year\\": \\"5535 40\\", \\"current_employment\\": \\"5535 40\\", \\"previous_employment\\": \\"0 00\\"}, \\"final_tax_code\\": \\"1250L\\"}, \\"national_insurance_contributions\\": {\\"in_this_employment\\": {\\"nic_letter\\": \\"A\\", \\"earnings_at_lel\\": \\"6144\\", \\"earnings_above_pt\\": \\"28422\\", \\"earnings_above_lel_to_pt\\": \\"2484\\"}}}","createdAt":"2025-05-23T16:17:36","updatedAt":"2025-05-23T16:17:46","createdBy":null},{"id":"9bf17755-2528-4e5b-a986-332b0fb20bcc","title":"P60 2020.pdf","description":"Uploaded document","filePath":"http://127.0.0.1:8080/api/storage/v1/files/blob/7975f820-a069-4dd2-8bb3-89ee4861a5a2.pdf","fileType":"application/pdf","fileSize":747482,"storageId":"67d4d22a-8a90-4516-b4cd-b50aa05f9b31","caseId":"44c6cd75-b7c4-4e27-b643-ab14c15ee3a0","documentType":"P60","downloadUrl":null,"metadataJson":"{\\"tax_year_end\\": \\"5 April 2020\\", \\"document_type\\": \\"P60 End of Year Certificate\\", \\"employee_details\\": {\\"surname\\": \\"ROCHA\\", \\"forenames_or_initials\\": \\"LUCAS CAVALCANTI\\", \\"national_insurance_number\\": \\"SS 47 21 88 A\\"}, \\"employee_instructions\\": {\\"purpose\\": \\"Please keep this certificate in a safe place as you will need it if you have to fill in a tax return. You also need it to make a claim for tax credits and Universal Credit or to renew your claim.\\\\nIt also helps you check that your employer is using the correct National Insurance number and deducting the right rate of National Insurance contributions.\\", \\"legal_requirement\\": \\"By law you are required to tell\\\\nHM Revenue and Customs about any income that is not fully taxed, even if you are not sent a tax return.\\"}, \\"pay_and_income_tax_details\\": {\\"pay\\": {\\"total_for_year\\": \\"40187 04\\", \\"current_employment\\": \\"40187 04\\", \\"previous_employment\\": \\"0 00\\"}, \\"income_tax\\": {\\"total_for_year\\": \\"5535 40\\", \\"current_employment\\": \\"5535 40\\", \\"previous_employment\\": \\"0 00\\"}, \\"final_tax_code\\": \\"1250L\\"}, \\"national_insurance_contributions\\": {\\"in_this_employment\\": {\\"nic_letter\\": \\"A\\", \\"earnings_at_lel\\": \\"6144\\", \\"earnings_above_pt\\": \\"28422\\", \\"earnings_above_lel_to_pt\\": \\"2484\\"}}}","createdAt":"2025-05-23T16:14:41","updatedAt":"2025-05-23T16:14:48","createdBy":null}],"documentsCount":2,"eventsCount":0}`;

export const mockGetWorkflowList = {
  workflow_instance_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
  user_id: '1',
  status: 'IN_PROGRESS',
  current_step_key: 'applicant_setup',
  created_at: '2025-06-12T09:29:23.953811',
  updated_at: '2025-06-13T05:43:38.151105',
  completed_at: null,
  workflow_definition_id: '1',
  steps: [
    {
      step_instance_id: 'bf00f547-889c-4716-8fe3-9e3088972564',
      workflow_instance_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
      step_key: 'applicant_setup',
      name: '1. Applicant & Application Setup',
      order: 1,
      status: 'ACTIVE',
      data: {
        form_data: [
          {
            question: {
              data: {
                name: 'Confirm your visa type选择您的签证类型',
              },
              answer: {
                type: 'radio',
                selector: '#visaType_visit-visa-ooc-standard',
                data: [
                  {
                    name: 'Visit or transit visa',
                    value: 'visit-visa-ooc-standard',
                    check: 1,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="visit-visa-ooc-standard"]',
                  },
                  {
                    name: 'Tier 1 (Investor)',
                    value: 'tier-1-investor-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="tier-1-investor-ooc"]',
                  },
                  {
                    name: 'Tier 1 (Entrepreneur)',
                    value: 'tier-1-entrepreneur-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="tier-1-entrepreneur-ooc"]',
                  },
                  {
                    name: 'Skilled Worker visa',
                    value: 'skilled-worker-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="skilled-worker-ooc"]',
                  },
                  {
                    name: 'British Nationals (Overseas) visa',
                    value: 'hkbno-ooc',
                    check: 0,
                    selector: '#visaType_visit-visa-ooc-standard[value="hkbno-ooc"]',
                  },
                  {
                    name: 'International Sportsperson',
                    value: 'international-sportsperson-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="international-sportsperson-ooc"]',
                  },
                  {
                    name: 'Tier 2 (Minister of Religion) visa',
                    value: 'tier2-minister-of-religion-ooc-standard',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="tier2-minister-of-religion-ooc-standard"]',
                  },
                  {
                    name: 'Frontier Worker',
                    value: 'frontier-worker-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="frontier-worker-ooc"]',
                  },
                  {
                    name: 'Short-term student visa',
                    value: 'short-term-student-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="short-term-student-ooc"]',
                  },
                  {
                    name: 'Student',
                    value: 'student-ooc',
                    check: 0,
                    selector: '#visaType_visit-visa-ooc-standard[value="student-ooc"]',
                  },
                  {
                    name: 'Child Student',
                    value: 'child-student-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="child-student-ooc"]',
                  },
                  {
                    name: 'Crown Dependency',
                    value: 'crown-dependency-channel',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="crown-dependency-channel"]',
                  },
                  {
                    name: 'Temporary Work',
                    value: 'temporary-work-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="temporary-work-ooc"]',
                  },
                  {
                    name: 'Global Talent visa',
                    value: 'global-talent-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="global-talent-ooc"]',
                  },
                  {
                    name: 'Start up & Innovator visa',
                    value: 'start-up-and-innovator-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="start-up-and-innovator-ooc"]',
                  },
                  {
                    name: 'Partner Dependant visa - PBS (including Student), Start-up, Innovator or Global Talent dependant partner',
                    value: 'pbs-dependant-partner-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="pbs-dependant-partner-ooc"]',
                  },
                  {
                    name: 'Child Dependant visa - PBS (including Student), Start-up, Innovator or Global Talent dependant child',
                    value: 'pbs-dependant-child-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="pbs-dependant-child-ooc"]',
                  },
                  {
                    name: 'Overseas Domestic Workers',
                    value: 'overseas-domestic-workers',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="overseas-domestic-workers"]',
                  },
                  {
                    name: 'Windrush Scheme Application (Overseas)',
                    value: 'windrush-scheme-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="windrush-scheme-ooc"]',
                  },
                  {
                    name: 'Appendix FM Partner',
                    value: 'appendix-fm-partner-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="appendix-fm-partner-ooc"]',
                  },
                  {
                    name: 'Appendix FM Child',
                    value: 'appendix-fm-child-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="appendix-fm-child-ooc"]',
                  },
                  {
                    name: 'EU Settlement Scheme Family Permit and Travel Permit',
                    value: 'efp-ooc',
                    check: 0,
                    selector: '#visaType_visit-visa-ooc-standard[value="efp-ooc"]',
                  },
                  {
                    name: 'Exempt Vignette',
                    value: 'exempt-vignette',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="exempt-vignette"]',
                  },
                  {
                    name: 'Right of Abode, Returning Resident, UK Ancestry',
                    value: 'roa-rr-uka-ooc',
                    check: 0,
                    selector: '#visaType_visit-visa-ooc-standard[value="roa-rr-uka-ooc"]',
                  },
                  {
                    name: 'Temporary visa to enter the UK, or to transfer or replace your visa (vignette) in your passport or travel document',
                    value: 'brp-vignette-transfer-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="brp-vignette-transfer-ooc"]',
                  },
                  {
                    name: 'Global Business Mobility',
                    value: 'global-business-mobility-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="global-business-mobility-ooc"]',
                  },
                  {
                    name: 'High Potential Individual',
                    value: 'high-potential-individual-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="high-potential-individual-ooc"]',
                  },
                  {
                    name: 'Scale Up',
                    value: 'scale-up-ooc',
                    check: 0,
                    selector: '#visaType_visit-visa-ooc-standard[value="scale-up-ooc"]',
                  },
                  {
                    name: 'Exemptfrom UK immigration control',
                    value: 'family-exempt-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="family-exempt-ooc"]',
                  },
                  {
                    name: 'Workingin the UK, the Channel Islands or the Isle of Man',
                    value: 'family-work-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="family-work-ooc"]',
                  },
                  {
                    name: 'Studyingin the UK, the Channel Islands or the Isle of Man',
                    value: 'family-study-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="family-study-ooc"]',
                  },
                  {
                    name: 'In the UK withprotection status',
                    value: 'family-reunion-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="family-reunion-ooc"]',
                  },
                  {
                    name: 'Childof a current or former member of UK armed forces (HM forces)',
                    value: 'family-af-child-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="family-af-child-ooc"]',
                  },
                  {
                    name: 'Partnerof a current or former member of UK armed forces (HM forces)',
                    value: 'family-af-partner-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="family-af-partner-ooc"]',
                  },
                  {
                    name: 'ABritish citizen, settled in the UKor in the UK for another reason',
                    value: 'family-settled-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="family-settled-ooc"]',
                  },
                  {
                    name: 'Member of armed forces subject to immigration control (course F) or the dependant of a member of armed forces subject to immigration control',
                    value: 'coursef-ooc',
                    check: 0,
                    selector: '#visaType_visit-visa-ooc-standard[value="coursef-ooc"]',
                  },
                  {
                    name: 'Relevant civilian employee, former member of UK armed forces (HM forces) or a bereaved family member',
                    value: 'armed-forces-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="armed-forces-ooc"]',
                  },
                  {
                    name: 'Otherworkvisas for the UK (non points-based working visas)',
                    value: 'work-ooc',
                    check: 0,
                    selector: '#visaType_visit-visa-ooc-standard[value="work-ooc"]',
                  },
                  {
                    name: 'Visit, study, workorsettlein certain Commonwealth countries or British overseas territories',
                    value: 'overseas-ooc',
                    check: 0,
                    selector: '#visaType_visit-visa-ooc-standard[value="overseas-ooc"]',
                  },
                  {
                    name: 'Return to the UK if you:were removed, deported or left the UK and have won an appeal against an immigration decision made by the Home Office, orwere last granted permission as a partner under the family or Armed Forces route (for example Appendix FM, Appendix AF, Appendix Family Life: Partner) or a partner of a person with refugee status and are seeking to return to the UK as:a victim of domestic abuse who has been abandoned outside the UK; ora child of a person who is a victim of domestic abuse who has been abandoned outside the UK.',
                    value: 'return-to-uk-ooc',
                    check: 0,
                    selector:
                      '#visaType_visit-visa-ooc-standard[value="return-to-uk-ooc"]',
                  },
                ],
              },
            },
          },
        ],
        actions: [],
        questions: [
          {
            id: 'q_csrfToken_0bef0615',
            field_selector: "input[type='hidden'][name='csrfToken']",
            field_name: 'csrfToken',
            field_type: 'hidden',
            field_label: 'Csrftoken',
            question: 'Confirm your visa type选择您的签证类型 - Csrftoken',
            required: false,
            options: [],
          },
          {
            id: 'q_visaType_743141e5',
            field_selector: '#visaType_visit-visa-ooc-standard',
            field_name: 'visaType',
            field_type: 'radio',
            field_label: 'Visit or transit visa',
            question: 'Confirm your visa type选择您的签证类型',
            required: false,
            options: [
              {
                value: 'visit-visa-ooc-standard',
                text: 'Visit or transit visa',
              },
              {
                value: 'tier-1-investor-ooc',
                text: 'Tier 1 (Investor)',
              },
              {
                value: 'tier-1-entrepreneur-ooc',
                text: 'Tier 1 (Entrepreneur)',
              },
              {
                value: 'skilled-worker-ooc',
                text: 'Skilled Worker visa',
              },
              {
                value: 'hkbno-ooc',
                text: 'British Nationals (Overseas) visa',
              },
              {
                value: 'international-sportsperson-ooc',
                text: 'International Sportsperson',
              },
              {
                value: 'tier2-minister-of-religion-ooc-standard',
                text: 'Tier 2 (Minister of Religion) visa',
              },
              {
                value: 'frontier-worker-ooc',
                text: 'Frontier Worker',
              },
              {
                value: 'short-term-student-ooc',
                text: 'Short-term student visa',
              },
              {
                value: 'student-ooc',
                text: 'Student',
              },
              {
                value: 'child-student-ooc',
                text: 'Child Student',
              },
              {
                value: 'crown-dependency-channel',
                text: 'Crown Dependency',
              },
              {
                value: 'temporary-work-ooc',
                text: 'Temporary Work',
              },
              {
                value: 'global-talent-ooc',
                text: 'Global Talent visa',
              },
              {
                value: 'start-up-and-innovator-ooc',
                text: 'Start up & Innovator visa',
              },
              {
                value: 'pbs-dependant-partner-ooc',
                text: 'Partner Dependant visa - PBS (including Student), Start-up, Innovator or Global Talent dependant partner',
              },
              {
                value: 'pbs-dependant-child-ooc',
                text: 'Child Dependant visa - PBS (including Student), Start-up, Innovator or Global Talent dependant child',
              },
              {
                value: 'overseas-domestic-workers',
                text: 'Overseas Domestic Workers',
              },
              {
                value: 'windrush-scheme-ooc',
                text: 'Windrush Scheme Application (Overseas)',
              },
              {
                value: 'appendix-fm-partner-ooc',
                text: 'Appendix FM Partner',
              },
              {
                value: 'appendix-fm-child-ooc',
                text: 'Appendix FM Child',
              },
              {
                value: 'efp-ooc',
                text: 'EU Settlement Scheme Family Permit and Travel Permit',
              },
              {
                value: 'exempt-vignette',
                text: 'Exempt Vignette',
              },
              {
                value: 'roa-rr-uka-ooc',
                text: 'Right of Abode, Returning Resident, UK Ancestry',
              },
              {
                value: 'brp-vignette-transfer-ooc',
                text: 'Temporary visa to enter the UK, or to transfer or replace your visa (vignette) in your passport or travel document',
              },
              {
                value: 'global-business-mobility-ooc',
                text: 'Global Business Mobility',
              },
              {
                value: 'high-potential-individual-ooc',
                text: 'High Potential Individual',
              },
              {
                value: 'scale-up-ooc',
                text: 'Scale Up',
              },
              {
                value: 'family-exempt-ooc',
                text: 'Exemptfrom UK immigration control',
              },
              {
                value: 'family-work-ooc',
                text: 'Workingin the UK, the Channel Islands or the Isle of Man',
              },
              {
                value: 'family-study-ooc',
                text: 'Studyingin the UK, the Channel Islands or the Isle of Man',
              },
              {
                value: 'family-reunion-ooc',
                text: 'In the UK withprotection status',
              },
              {
                value: 'family-af-child-ooc',
                text: 'Childof a current or former member of UK armed forces (HM forces)',
              },
              {
                value: 'family-af-partner-ooc',
                text: 'Partnerof a current or former member of UK armed forces (HM forces)',
              },
              {
                value: 'family-settled-ooc',
                text: 'ABritish citizen, settled in the UKor in the UK for another reason',
              },
              {
                value: 'coursef-ooc',
                text: 'Member of armed forces subject to immigration control (course F) or the dependant of a member of armed forces subject to immigration control',
              },
              {
                value: 'armed-forces-ooc',
                text: 'Relevant civilian employee, former member of UK armed forces (HM forces) or a bereaved family member',
              },
              {
                value: 'work-ooc',
                text: 'Otherworkvisas for the UK (non points-based working visas)',
              },
              {
                value: 'overseas-ooc',
                text: 'Visit, study, workorsettlein certain Commonwealth countries or British overseas territories',
              },
              {
                value: 'return-to-uk-ooc',
                text: 'Return to the UK if you:were removed, deported or left the UK and have won an appeal against an immigration decision made by the Home Office, orwere last granted permission as a partner under the family or Armed Forces route (for example Appendix FM, Appendix AF, Appendix Family Life: Partner) or a partner of a person with refugee status and are seeking to return to the UK as:a victim of domestic abuse who has been abandoned outside the UK; ora child of a person who is a victim of domestic abuse who has been abandoned outside the UK.',
              },
            ],
          },
        ],
        metadata: {
          processed_at: '2025-06-13T06:30:17.719573',
          workflow_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
          step_key: 'applicant_setup',
          success: true,
          field_count: 2,
          question_count: 2,
          answer_count: 2,
          action_count: 0,
        },
        history: [
          {
            timestamp: '2025-06-13T06:30:17.719573',
            form_data: [
              {
                question: {
                  data: {
                    name: 'Confirm your visa type选择您的签证类型',
                  },
                  answer: {
                    type: 'radio',
                    selector: '#visaType_visit-visa-ooc-standard',
                    data: [
                      {
                        name: 'Visit or transit visa',
                        value: 'visit-visa-ooc-standard',
                        check: 1,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="visit-visa-ooc-standard"]',
                      },
                      {
                        name: 'Tier 1 (Investor)',
                        value: 'tier-1-investor-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="tier-1-investor-ooc"]',
                      },
                      {
                        name: 'Tier 1 (Entrepreneur)',
                        value: 'tier-1-entrepreneur-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="tier-1-entrepreneur-ooc"]',
                      },
                      {
                        name: 'Skilled Worker visa',
                        value: 'skilled-worker-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="skilled-worker-ooc"]',
                      },
                      {
                        name: 'British Nationals (Overseas) visa',
                        value: 'hkbno-ooc',
                        check: 0,
                        selector: '#visaType_visit-visa-ooc-standard[value="hkbno-ooc"]',
                      },
                      {
                        name: 'International Sportsperson',
                        value: 'international-sportsperson-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="international-sportsperson-ooc"]',
                      },
                      {
                        name: 'Tier 2 (Minister of Religion) visa',
                        value: 'tier2-minister-of-religion-ooc-standard',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="tier2-minister-of-religion-ooc-standard"]',
                      },
                      {
                        name: 'Frontier Worker',
                        value: 'frontier-worker-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="frontier-worker-ooc"]',
                      },
                      {
                        name: 'Short-term student visa',
                        value: 'short-term-student-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="short-term-student-ooc"]',
                      },
                      {
                        name: 'Student',
                        value: 'student-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="student-ooc"]',
                      },
                      {
                        name: 'Child Student',
                        value: 'child-student-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="child-student-ooc"]',
                      },
                      {
                        name: 'Crown Dependency',
                        value: 'crown-dependency-channel',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="crown-dependency-channel"]',
                      },
                      {
                        name: 'Temporary Work',
                        value: 'temporary-work-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="temporary-work-ooc"]',
                      },
                      {
                        name: 'Global Talent visa',
                        value: 'global-talent-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="global-talent-ooc"]',
                      },
                      {
                        name: 'Start up & Innovator visa',
                        value: 'start-up-and-innovator-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="start-up-and-innovator-ooc"]',
                      },
                      {
                        name: 'Partner Dependant visa - PBS (including Student), Start-up, Innovator or Global Talent dependant partner',
                        value: 'pbs-dependant-partner-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="pbs-dependant-partner-ooc"]',
                      },
                      {
                        name: 'Child Dependant visa - PBS (including Student), Start-up, Innovator or Global Talent dependant child',
                        value: 'pbs-dependant-child-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="pbs-dependant-child-ooc"]',
                      },
                      {
                        name: 'Overseas Domestic Workers',
                        value: 'overseas-domestic-workers',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="overseas-domestic-workers"]',
                      },
                      {
                        name: 'Windrush Scheme Application (Overseas)',
                        value: 'windrush-scheme-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="windrush-scheme-ooc"]',
                      },
                      {
                        name: 'Appendix FM Partner',
                        value: 'appendix-fm-partner-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="appendix-fm-partner-ooc"]',
                      },
                      {
                        name: 'Appendix FM Child',
                        value: 'appendix-fm-child-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="appendix-fm-child-ooc"]',
                      },
                      {
                        name: 'EU Settlement Scheme Family Permit and Travel Permit',
                        value: 'efp-ooc',
                        check: 0,
                        selector: '#visaType_visit-visa-ooc-standard[value="efp-ooc"]',
                      },
                      {
                        name: 'Exempt Vignette',
                        value: 'exempt-vignette',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="exempt-vignette"]',
                      },
                      {
                        name: 'Right of Abode, Returning Resident, UK Ancestry',
                        value: 'roa-rr-uka-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="roa-rr-uka-ooc"]',
                      },
                      {
                        name: 'Temporary visa to enter the UK, or to transfer or replace your visa (vignette) in your passport or travel document',
                        value: 'brp-vignette-transfer-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="brp-vignette-transfer-ooc"]',
                      },
                      {
                        name: 'Global Business Mobility',
                        value: 'global-business-mobility-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="global-business-mobility-ooc"]',
                      },
                      {
                        name: 'High Potential Individual',
                        value: 'high-potential-individual-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="high-potential-individual-ooc"]',
                      },
                      {
                        name: 'Scale Up',
                        value: 'scale-up-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="scale-up-ooc"]',
                      },
                      {
                        name: 'Exemptfrom UK immigration control',
                        value: 'family-exempt-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="family-exempt-ooc"]',
                      },
                      {
                        name: 'Workingin the UK, the Channel Islands or the Isle of Man',
                        value: 'family-work-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="family-work-ooc"]',
                      },
                      {
                        name: 'Studyingin the UK, the Channel Islands or the Isle of Man',
                        value: 'family-study-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="family-study-ooc"]',
                      },
                      {
                        name: 'In the UK withprotection status',
                        value: 'family-reunion-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="family-reunion-ooc"]',
                      },
                      {
                        name: 'Childof a current or former member of UK armed forces (HM forces)',
                        value: 'family-af-child-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="family-af-child-ooc"]',
                      },
                      {
                        name: 'Partnerof a current or former member of UK armed forces (HM forces)',
                        value: 'family-af-partner-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="family-af-partner-ooc"]',
                      },
                      {
                        name: 'ABritish citizen, settled in the UKor in the UK for another reason',
                        value: 'family-settled-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="family-settled-ooc"]',
                      },
                      {
                        name: 'Member of armed forces subject to immigration control (course F) or the dependant of a member of armed forces subject to immigration control',
                        value: 'coursef-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="coursef-ooc"]',
                      },
                      {
                        name: 'Relevant civilian employee, former member of UK armed forces (HM forces) or a bereaved family member',
                        value: 'armed-forces-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="armed-forces-ooc"]',
                      },
                      {
                        name: 'Otherworkvisas for the UK (non points-based working visas)',
                        value: 'work-ooc',
                        check: 0,
                        selector: '#visaType_visit-visa-ooc-standard[value="work-ooc"]',
                      },
                      {
                        name: 'Visit, study, workorsettlein certain Commonwealth countries or British overseas territories',
                        value: 'overseas-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="overseas-ooc"]',
                      },
                      {
                        name: 'Return to the UK if you:were removed, deported or left the UK and have won an appeal against an immigration decision made by the Home Office, orwere last granted permission as a partner under the family or Armed Forces route (for example Appendix FM, Appendix AF, Appendix Family Life: Partner) or a partner of a person with refugee status and are seeking to return to the UK as:a victim of domestic abuse who has been abandoned outside the UK; ora child of a person who is a victim of domestic abuse who has been abandoned outside the UK.',
                        value: 'return-to-uk-ooc',
                        check: 0,
                        selector:
                          '#visaType_visit-visa-ooc-standard[value="return-to-uk-ooc"]',
                      },
                    ],
                  },
                },
              },
            ],
            actions: [],
            metadata: {
              processed_at: '2025-06-13T06:30:17.719573',
              workflow_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
              step_key: 'applicant_setup',
              success: true,
              field_count: 2,
              question_count: 2,
              answer_count: 2,
              action_count: 0,
            },
          },
        ],
      },
      next_step_url: null,
      started_at: '2025-06-12T09:29:24.008716',
      completed_at: '2025-06-13T03:29:26.077036',
      error_details: null,
    },
    {
      step_instance_id: '92909080-b2f4-4423-8781-3d6ae7b28e51',
      workflow_instance_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
      step_key: 'personal_details',
      name: '2. Personal Details',
      order: 2,
      status: 'PENDING',
      data: null,
      next_step_url: null,
      started_at: null,
      completed_at: null,
      error_details: null,
    },
    {
      step_instance_id: '01943541-92fd-472f-a27a-5333831bf758',
      workflow_instance_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
      step_key: 'contact_address',
      name: '3. Contact & Address',
      order: 3,
      status: 'PENDING',
      data: null,
      next_step_url: null,
      started_at: null,
      completed_at: null,
      error_details: null,
    },
    {
      step_instance_id: '0fe562c6-435a-44c6-89c7-76882a112d5d',
      workflow_instance_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
      step_key: 'family_details',
      name: '4. Family Details',
      order: 4,
      status: 'PENDING',
      data: null,
      next_step_url: null,
      started_at: null,
      completed_at: null,
      error_details: null,
    },
    {
      step_instance_id: 'cb63b6d1-1931-4402-bda6-e8632c658dce',
      workflow_instance_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
      step_key: 'travel_history',
      name: '5. Travel History',
      order: 5,
      status: 'PENDING',
      data: null,
      next_step_url: null,
      started_at: null,
      completed_at: null,
      error_details: null,
    },
    {
      step_instance_id: 'f0b26115-2ceb-4319-adc9-b09ca281b9dd',
      workflow_instance_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
      step_key: 'immigration_history',
      name: '6. Immigration History',
      order: 6,
      status: 'PENDING',
      data: null,
      next_step_url: null,
      started_at: null,
      completed_at: null,
      error_details: null,
    },
    {
      step_instance_id: 'f4bb2f54-ebff-4927-bf9c-c1d89368040c',
      workflow_instance_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
      step_key: 'employment_sponsor',
      name: '7. Employment & Sponsor',
      order: 7,
      status: 'PENDING',
      data: null,
      next_step_url: null,
      started_at: null,
      completed_at: null,
      error_details: null,
    },
    {
      step_instance_id: '9ee5b0ed-2588-4067-802b-c68e6b18eb7e',
      workflow_instance_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
      step_key: 'english_language',
      name: '8. English Language',
      order: 8,
      status: 'PENDING',
      data: null,
      next_step_url: null,
      started_at: null,
      completed_at: null,
      error_details: null,
    },
    {
      step_instance_id: '62885eae-1e1f-4bb8-bdfa-78e6a62f1701',
      workflow_instance_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
      step_key: 'financial_requirements',
      name: '9. Financial Requirements',
      order: 9,
      status: 'PENDING',
      data: null,
      next_step_url: null,
      started_at: null,
      completed_at: null,
      error_details: null,
    },
    {
      step_instance_id: '720e2ee3-e55f-4a97-9b60-158625a1413e',
      workflow_instance_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
      step_key: 'security_character',
      name: '10. Security & Character',
      order: 10,
      status: 'PENDING',
      data: null,
      next_step_url: null,
      started_at: null,
      completed_at: null,
      error_details: null,
    },
    {
      step_instance_id: 'f1a35d83-0688-4a38-8701-370f54903af1',
      workflow_instance_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
      step_key: 'additional_information',
      name: '11. Additional Information',
      order: 11,
      status: 'PENDING',
      data: null,
      next_step_url: null,
      started_at: null,
      completed_at: null,
      error_details: null,
    },
    {
      step_instance_id: '97ec49fe-8e32-4cc5-8fb8-b6b6dc2cda3c',
      workflow_instance_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
      step_key: 'application_declaration',
      name: '12. Application & Declaration',
      order: 12,
      status: 'PENDING',
      data: null,
      next_step_url: null,
      started_at: null,
      completed_at: null,
      error_details: null,
    },
  ],
};

export const mockGetWorkflowStepData = {
  form_data: [
    {
      question: {
        data: {
          name: 'Confirm your visa type选择您的签证类型',
        },
        answer: {
          type: 'radio',
          selector: '#visaType_visit-visa-ooc-standard',
          data: [
            {
              name: 'Visit or transit visa',
              value: 'visit-visa-ooc-standard',
              check: 1,
              selector:
                '#visaType_visit-visa-ooc-standard[value="visit-visa-ooc-standard"]',
            },
            {
              name: 'Tier 1 (Investor)',
              value: 'tier-1-investor-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="tier-1-investor-ooc"]',
            },
            {
              name: 'Tier 1 (Entrepreneur)',
              value: 'tier-1-entrepreneur-ooc',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="tier-1-entrepreneur-ooc"]',
            },
            {
              name: 'Skilled Worker visa',
              value: 'skilled-worker-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="skilled-worker-ooc"]',
            },
            {
              name: 'British Nationals (Overseas) visa',
              value: 'hkbno-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="hkbno-ooc"]',
            },
            {
              name: 'International Sportsperson',
              value: 'international-sportsperson-ooc',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="international-sportsperson-ooc"]',
            },
            {
              name: 'Tier 2 (Minister of Religion) visa',
              value: 'tier2-minister-of-religion-ooc-standard',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="tier2-minister-of-religion-ooc-standard"]',
            },
            {
              name: 'Frontier Worker',
              value: 'frontier-worker-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="frontier-worker-ooc"]',
            },
            {
              name: 'Short-term student visa',
              value: 'short-term-student-ooc',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="short-term-student-ooc"]',
            },
            {
              name: 'Student',
              value: 'student-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="student-ooc"]',
            },
            {
              name: 'Child Student',
              value: 'child-student-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="child-student-ooc"]',
            },
            {
              name: 'Crown Dependency',
              value: 'crown-dependency-channel',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="crown-dependency-channel"]',
            },
            {
              name: 'Temporary Work',
              value: 'temporary-work-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="temporary-work-ooc"]',
            },
            {
              name: 'Global Talent visa',
              value: 'global-talent-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="global-talent-ooc"]',
            },
            {
              name: 'Start up & Innovator visa',
              value: 'start-up-and-innovator-ooc',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="start-up-and-innovator-ooc"]',
            },
            {
              name: 'Partner Dependant visa - PBS (including Student), Start-up, Innovator or Global Talent dependant partner',
              value: 'pbs-dependant-partner-ooc',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="pbs-dependant-partner-ooc"]',
            },
            {
              name: 'Child Dependant visa - PBS (including Student), Start-up, Innovator or Global Talent dependant child',
              value: 'pbs-dependant-child-ooc',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="pbs-dependant-child-ooc"]',
            },
            {
              name: 'Overseas Domestic Workers',
              value: 'overseas-domestic-workers',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="overseas-domestic-workers"]',
            },
            {
              name: 'Windrush Scheme Application (Overseas)',
              value: 'windrush-scheme-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="windrush-scheme-ooc"]',
            },
            {
              name: 'Appendix FM Partner',
              value: 'appendix-fm-partner-ooc',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="appendix-fm-partner-ooc"]',
            },
            {
              name: 'Appendix FM Child',
              value: 'appendix-fm-child-ooc',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="appendix-fm-child-ooc"]',
            },
            {
              name: 'EU Settlement Scheme Family Permit and Travel Permit',
              value: 'efp-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="efp-ooc"]',
            },
            {
              name: 'Exempt Vignette',
              value: 'exempt-vignette',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="exempt-vignette"]',
            },
            {
              name: 'Right of Abode, Returning Resident, UK Ancestry',
              value: 'roa-rr-uka-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="roa-rr-uka-ooc"]',
            },
            {
              name: 'Temporary visa to enter the UK, or to transfer or replace your visa (vignette) in your passport or travel document',
              value: 'brp-vignette-transfer-ooc',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="brp-vignette-transfer-ooc"]',
            },
            {
              name: 'Global Business Mobility',
              value: 'global-business-mobility-ooc',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="global-business-mobility-ooc"]',
            },
            {
              name: 'High Potential Individual',
              value: 'high-potential-individual-ooc',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="high-potential-individual-ooc"]',
            },
            {
              name: 'Scale Up',
              value: 'scale-up-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="scale-up-ooc"]',
            },
            {
              name: 'Exemptfrom UK immigration control',
              value: 'family-exempt-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="family-exempt-ooc"]',
            },
            {
              name: 'Workingin the UK, the Channel Islands or the Isle of Man',
              value: 'family-work-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="family-work-ooc"]',
            },
            {
              name: 'Studyingin the UK, the Channel Islands or the Isle of Man',
              value: 'family-study-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="family-study-ooc"]',
            },
            {
              name: 'In the UK withprotection status',
              value: 'family-reunion-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="family-reunion-ooc"]',
            },
            {
              name: 'Childof a current or former member of UK armed forces (HM forces)',
              value: 'family-af-child-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="family-af-child-ooc"]',
            },
            {
              name: 'Partnerof a current or former member of UK armed forces (HM forces)',
              value: 'family-af-partner-ooc',
              check: 0,
              selector:
                '#visaType_visit-visa-ooc-standard[value="family-af-partner-ooc"]',
            },
            {
              name: 'ABritish citizen, settled in the UKor in the UK for another reason',
              value: 'family-settled-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="family-settled-ooc"]',
            },
            {
              name: 'Member of armed forces subject to immigration control (course F) or the dependant of a member of armed forces subject to immigration control',
              value: 'coursef-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="coursef-ooc"]',
            },
            {
              name: 'Relevant civilian employee, former member of UK armed forces (HM forces) or a bereaved family member',
              value: 'armed-forces-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="armed-forces-ooc"]',
            },
            {
              name: 'Otherworkvisas for the UK (non points-based working visas)',
              value: 'work-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="work-ooc"]',
            },
            {
              name: 'Visit, study, workorsettlein certain Commonwealth countries or British overseas territories',
              value: 'overseas-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="overseas-ooc"]',
            },
            {
              name: 'Return to the UK if you:were removed, deported or left the UK and have won an appeal against an immigration decision made by the Home Office, orwere last granted permission as a partner under the family or Armed Forces route (for example Appendix FM, Appendix AF, Appendix Family Life: Partner) or a partner of a person with refugee status and are seeking to return to the UK as:a victim of domestic abuse who has been abandoned outside the UK; ora child of a person who is a victim of domestic abuse who has been abandoned outside the UK.',
              value: 'return-to-uk-ooc',
              check: 0,
              selector: '#visaType_visit-visa-ooc-standard[value="return-to-uk-ooc"]',
            },
          ],
        },
      },
    },
  ],
  actions: [],
  questions: [
    {
      id: 'q_csrfToken_0bef0615',
      field_selector: "input[type='hidden'][name='csrfToken']",
      field_name: 'csrfToken',
      field_type: 'hidden',
      field_label: 'Csrftoken',
      question: 'Confirm your visa type选择您的签证类型 - Csrftoken',
      required: false,
      options: [],
    },
    {
      id: 'q_visaType_743141e5',
      field_selector: '#visaType_visit-visa-ooc-standard',
      field_name: 'visaType',
      field_type: 'radio',
      field_label: 'Visit or transit visa',
      question: 'Confirm your visa type选择您的签证类型',
      required: false,
      options: [
        {
          value: 'visit-visa-ooc-standard',
          text: 'Visit or transit visa',
        },
        {
          value: 'tier-1-investor-ooc',
          text: 'Tier 1 (Investor)',
        },
        {
          value: 'tier-1-entrepreneur-ooc',
          text: 'Tier 1 (Entrepreneur)',
        },
        {
          value: 'skilled-worker-ooc',
          text: 'Skilled Worker visa',
        },
        {
          value: 'hkbno-ooc',
          text: 'British Nationals (Overseas) visa',
        },
        {
          value: 'international-sportsperson-ooc',
          text: 'International Sportsperson',
        },
        {
          value: 'tier2-minister-of-religion-ooc-standard',
          text: 'Tier 2 (Minister of Religion) visa',
        },
        {
          value: 'frontier-worker-ooc',
          text: 'Frontier Worker',
        },
        {
          value: 'short-term-student-ooc',
          text: 'Short-term student visa',
        },
        {
          value: 'student-ooc',
          text: 'Student',
        },
        {
          value: 'child-student-ooc',
          text: 'Child Student',
        },
        {
          value: 'crown-dependency-channel',
          text: 'Crown Dependency',
        },
        {
          value: 'temporary-work-ooc',
          text: 'Temporary Work',
        },
        {
          value: 'global-talent-ooc',
          text: 'Global Talent visa',
        },
        {
          value: 'start-up-and-innovator-ooc',
          text: 'Start up & Innovator visa',
        },
        {
          value: 'pbs-dependant-partner-ooc',
          text: 'Partner Dependant visa - PBS (including Student), Start-up, Innovator or Global Talent dependant partner',
        },
        {
          value: 'pbs-dependant-child-ooc',
          text: 'Child Dependant visa - PBS (including Student), Start-up, Innovator or Global Talent dependant child',
        },
        {
          value: 'overseas-domestic-workers',
          text: 'Overseas Domestic Workers',
        },
        {
          value: 'windrush-scheme-ooc',
          text: 'Windrush Scheme Application (Overseas)',
        },
        {
          value: 'appendix-fm-partner-ooc',
          text: 'Appendix FM Partner',
        },
        {
          value: 'appendix-fm-child-ooc',
          text: 'Appendix FM Child',
        },
        {
          value: 'efp-ooc',
          text: 'EU Settlement Scheme Family Permit and Travel Permit',
        },
        {
          value: 'exempt-vignette',
          text: 'Exempt Vignette',
        },
        {
          value: 'roa-rr-uka-ooc',
          text: 'Right of Abode, Returning Resident, UK Ancestry',
        },
        {
          value: 'brp-vignette-transfer-ooc',
          text: 'Temporary visa to enter the UK, or to transfer or replace your visa (vignette) in your passport or travel document',
        },
        {
          value: 'global-business-mobility-ooc',
          text: 'Global Business Mobility',
        },
        {
          value: 'high-potential-individual-ooc',
          text: 'High Potential Individual',
        },
        {
          value: 'scale-up-ooc',
          text: 'Scale Up',
        },
        {
          value: 'family-exempt-ooc',
          text: 'Exemptfrom UK immigration control',
        },
        {
          value: 'family-work-ooc',
          text: 'Workingin the UK, the Channel Islands or the Isle of Man',
        },
        {
          value: 'family-study-ooc',
          text: 'Studyingin the UK, the Channel Islands or the Isle of Man',
        },
        {
          value: 'family-reunion-ooc',
          text: 'In the UK withprotection status',
        },
        {
          value: 'family-af-child-ooc',
          text: 'Childof a current or former member of UK armed forces (HM forces)',
        },
        {
          value: 'family-af-partner-ooc',
          text: 'Partnerof a current or former member of UK armed forces (HM forces)',
        },
        {
          value: 'family-settled-ooc',
          text: 'ABritish citizen, settled in the UKor in the UK for another reason',
        },
        {
          value: 'coursef-ooc',
          text: 'Member of armed forces subject to immigration control (course F) or the dependant of a member of armed forces subject to immigration control',
        },
        {
          value: 'armed-forces-ooc',
          text: 'Relevant civilian employee, former member of UK armed forces (HM forces) or a bereaved family member',
        },
        {
          value: 'work-ooc',
          text: 'Otherworkvisas for the UK (non points-based working visas)',
        },
        {
          value: 'overseas-ooc',
          text: 'Visit, study, workorsettlein certain Commonwealth countries or British overseas territories',
        },
        {
          value: 'return-to-uk-ooc',
          text: 'Return to the UK if you:were removed, deported or left the UK and have won an appeal against an immigration decision made by the Home Office, orwere last granted permission as a partner under the family or Armed Forces route (for example Appendix FM, Appendix AF, Appendix Family Life: Partner) or a partner of a person with refugee status and are seeking to return to the UK as:a victim of domestic abuse who has been abandoned outside the UK; ora child of a person who is a victim of domestic abuse who has been abandoned outside the UK.',
        },
      ],
    },
  ],
  metadata: {
    processed_at: '2025-06-13T06:30:17.719573',
    workflow_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
    step_key: 'applicant_setup',
    success: true,
    field_count: 2,
    question_count: 2,
    answer_count: 2,
    action_count: 0,
  },
  history: [
    {
      timestamp: '2025-06-13T06:30:17.719573',
      form_data: [
        {
          question: {
            data: {
              name: 'Confirm your visa type选择您的签证类型',
            },
            answer: {
              type: 'radio',
              selector: '#visaType_visit-visa-ooc-standard',
              data: [
                {
                  name: 'Visit or transit visa',
                  value: 'visit-visa-ooc-standard',
                  check: 1,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="visit-visa-ooc-standard"]',
                },
                {
                  name: 'Tier 1 (Investor)',
                  value: 'tier-1-investor-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="tier-1-investor-ooc"]',
                },
                {
                  name: 'Tier 1 (Entrepreneur)',
                  value: 'tier-1-entrepreneur-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="tier-1-entrepreneur-ooc"]',
                },
                {
                  name: 'Skilled Worker visa',
                  value: 'skilled-worker-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="skilled-worker-ooc"]',
                },
                {
                  name: 'British Nationals (Overseas) visa',
                  value: 'hkbno-ooc',
                  check: 0,
                  selector: '#visaType_visit-visa-ooc-standard[value="hkbno-ooc"]',
                },
                {
                  name: 'International Sportsperson',
                  value: 'international-sportsperson-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="international-sportsperson-ooc"]',
                },
                {
                  name: 'Tier 2 (Minister of Religion) visa',
                  value: 'tier2-minister-of-religion-ooc-standard',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="tier2-minister-of-religion-ooc-standard"]',
                },
                {
                  name: 'Frontier Worker',
                  value: 'frontier-worker-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="frontier-worker-ooc"]',
                },
                {
                  name: 'Short-term student visa',
                  value: 'short-term-student-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="short-term-student-ooc"]',
                },
                {
                  name: 'Student',
                  value: 'student-ooc',
                  check: 0,
                  selector: '#visaType_visit-visa-ooc-standard[value="student-ooc"]',
                },
                {
                  name: 'Child Student',
                  value: 'child-student-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="child-student-ooc"]',
                },
                {
                  name: 'Crown Dependency',
                  value: 'crown-dependency-channel',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="crown-dependency-channel"]',
                },
                {
                  name: 'Temporary Work',
                  value: 'temporary-work-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="temporary-work-ooc"]',
                },
                {
                  name: 'Global Talent visa',
                  value: 'global-talent-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="global-talent-ooc"]',
                },
                {
                  name: 'Start up & Innovator visa',
                  value: 'start-up-and-innovator-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="start-up-and-innovator-ooc"]',
                },
                {
                  name: 'Partner Dependant visa - PBS (including Student), Start-up, Innovator or Global Talent dependant partner',
                  value: 'pbs-dependant-partner-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="pbs-dependant-partner-ooc"]',
                },
                {
                  name: 'Child Dependant visa - PBS (including Student), Start-up, Innovator or Global Talent dependant child',
                  value: 'pbs-dependant-child-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="pbs-dependant-child-ooc"]',
                },
                {
                  name: 'Overseas Domestic Workers',
                  value: 'overseas-domestic-workers',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="overseas-domestic-workers"]',
                },
                {
                  name: 'Windrush Scheme Application (Overseas)',
                  value: 'windrush-scheme-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="windrush-scheme-ooc"]',
                },
                {
                  name: 'Appendix FM Partner',
                  value: 'appendix-fm-partner-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="appendix-fm-partner-ooc"]',
                },
                {
                  name: 'Appendix FM Child',
                  value: 'appendix-fm-child-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="appendix-fm-child-ooc"]',
                },
                {
                  name: 'EU Settlement Scheme Family Permit and Travel Permit',
                  value: 'efp-ooc',
                  check: 0,
                  selector: '#visaType_visit-visa-ooc-standard[value="efp-ooc"]',
                },
                {
                  name: 'Exempt Vignette',
                  value: 'exempt-vignette',
                  check: 0,
                  selector: '#visaType_visit-visa-ooc-standard[value="exempt-vignette"]',
                },
                {
                  name: 'Right of Abode, Returning Resident, UK Ancestry',
                  value: 'roa-rr-uka-ooc',
                  check: 0,
                  selector: '#visaType_visit-visa-ooc-standard[value="roa-rr-uka-ooc"]',
                },
                {
                  name: 'Temporary visa to enter the UK, or to transfer or replace your visa (vignette) in your passport or travel document',
                  value: 'brp-vignette-transfer-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="brp-vignette-transfer-ooc"]',
                },
                {
                  name: 'Global Business Mobility',
                  value: 'global-business-mobility-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="global-business-mobility-ooc"]',
                },
                {
                  name: 'High Potential Individual',
                  value: 'high-potential-individual-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="high-potential-individual-ooc"]',
                },
                {
                  name: 'Scale Up',
                  value: 'scale-up-ooc',
                  check: 0,
                  selector: '#visaType_visit-visa-ooc-standard[value="scale-up-ooc"]',
                },
                {
                  name: 'Exemptfrom UK immigration control',
                  value: 'family-exempt-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="family-exempt-ooc"]',
                },
                {
                  name: 'Workingin the UK, the Channel Islands or the Isle of Man',
                  value: 'family-work-ooc',
                  check: 0,
                  selector: '#visaType_visit-visa-ooc-standard[value="family-work-ooc"]',
                },
                {
                  name: 'Studyingin the UK, the Channel Islands or the Isle of Man',
                  value: 'family-study-ooc',
                  check: 0,
                  selector: '#visaType_visit-visa-ooc-standard[value="family-study-ooc"]',
                },
                {
                  name: 'In the UK withprotection status',
                  value: 'family-reunion-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="family-reunion-ooc"]',
                },
                {
                  name: 'Childof a current or former member of UK armed forces (HM forces)',
                  value: 'family-af-child-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="family-af-child-ooc"]',
                },
                {
                  name: 'Partnerof a current or former member of UK armed forces (HM forces)',
                  value: 'family-af-partner-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="family-af-partner-ooc"]',
                },
                {
                  name: 'ABritish citizen, settled in the UKor in the UK for another reason',
                  value: 'family-settled-ooc',
                  check: 0,
                  selector:
                    '#visaType_visit-visa-ooc-standard[value="family-settled-ooc"]',
                },
                {
                  name: 'Member of armed forces subject to immigration control (course F) or the dependant of a member of armed forces subject to immigration control',
                  value: 'coursef-ooc',
                  check: 0,
                  selector: '#visaType_visit-visa-ooc-standard[value="coursef-ooc"]',
                },
                {
                  name: 'Relevant civilian employee, former member of UK armed forces (HM forces) or a bereaved family member',
                  value: 'armed-forces-ooc',
                  check: 0,
                  selector: '#visaType_visit-visa-ooc-standard[value="armed-forces-ooc"]',
                },
                {
                  name: 'Otherworkvisas for the UK (non points-based working visas)',
                  value: 'work-ooc',
                  check: 0,
                  selector: '#visaType_visit-visa-ooc-standard[value="work-ooc"]',
                },
                {
                  name: 'Visit, study, workorsettlein certain Commonwealth countries or British overseas territories',
                  value: 'overseas-ooc',
                  check: 0,
                  selector: '#visaType_visit-visa-ooc-standard[value="overseas-ooc"]',
                },
                {
                  name: 'Return to the UK if you:were removed, deported or left the UK and have won an appeal against an immigration decision made by the Home Office, orwere last granted permission as a partner under the family or Armed Forces route (for example Appendix FM, Appendix AF, Appendix Family Life: Partner) or a partner of a person with refugee status and are seeking to return to the UK as:a victim of domestic abuse who has been abandoned outside the UK; ora child of a person who is a victim of domestic abuse who has been abandoned outside the UK.',
                  value: 'return-to-uk-ooc',
                  check: 0,
                  selector: '#visaType_visit-visa-ooc-standard[value="return-to-uk-ooc"]',
                },
              ],
            },
          },
        },
      ],
      actions: [],
      metadata: {
        processed_at: '2025-06-13T06:30:17.719573',
        workflow_id: '1221f2f4-5311-4e15-b7dd-aecd4f8d9401',
        step_key: 'applicant_setup',
        success: true,
        field_count: 2,
        question_count: 2,
        answer_count: 2,
        action_count: 0,
      },
    },
  ],
};
