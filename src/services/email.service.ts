import { injectable } from 'tsyringe';
import nodemailer, { Transporter } from 'nodemailer';
import { config } from '@config';
import { AppError } from '@core/AppError';
import { HttpStatusCode } from '@core/HttpStatus';
import logger from '@utils/logger';
import type { applications, vessels, passengers } from '@prisma/client';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface ApplicationWithDetails extends applications {
  vessels: vessels;
  passengers: passengers[];
}

@injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.get('email.host'),
      port: config.get('email.port'),
      secure: config.get('email.secure'),
      auth: {
        user: config.get('email.auth.user'),
        pass: config.get('email.auth.pass'),
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service', error);
      // Don't throw here to allow the app to start even if email is misconfigured
    }
  }

  public async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const fromName = config.get('email.from.name');
      const fromAddress = config.get('email.from.address');

      const mailOptions = {
        from: `${fromName} <${fromAddress}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      logger.info('Sending email', { 
        to: mailOptions.to, 
        subject: mailOptions.subject 
      });

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', { 
        messageId: result.messageId,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
    } catch (error) {
      logger.error('Failed to send email', {
        to: options.to,
        subject: options.subject,
        error
      });
      throw new AppError(
        'Failed to send email',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async sendApplication(applicationWithDetails: ApplicationWithDetails, paymentAmount?: number, paymentCurrency?: string): Promise<void> {
    const subject = `Translog Application - ${applicationWithDetails.id}`;
    
    // Format dates
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Format vessel type
    const formatVesselType = (type: string) => {
      const typeMap: { [key: string]: string } = {
        'yelkenli': 'Sailboat',
        'motorlu': 'Motor Boat',
        'katamaran': 'Catamaran',
        'yat': 'Yacht',
        'di_er': 'Other'
      };
      return typeMap[type] || type;
    };

    // Generate passengers table
    const passengersTable = applicationWithDetails.passengers.length > 0 
      ? `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Name</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Nationality</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Passport</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Date of Birth</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Gender</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Passport Scan</th>
            </tr>
          </thead>
          <tbody>
            ${applicationWithDetails.passengers.map(passenger => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px;">${passenger.name} ${passenger.surname}</td>
                <td style="border: 1px solid #ddd; padding: 12px;">${passenger.nationality}</td>
                <td style="border: 1px solid #ddd; padding: 12px;">${passenger.passport_number}</td>
                <td style="border: 1px solid #ddd; padding: 12px;">${passenger.date_of_birth ? formatDate(passenger.date_of_birth) : 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 12px;">${passenger.gender || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 12px;">
                  <a href="${passenger.passport_scan_url}" target="_blank" style="color: #007bff; text-decoration: none;">
                    View Passport Scan
                  </a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
      : '<p><em>No passengers listed for this application.</em></p>';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
          🎉 Payment Confirmed - Application Submitted Successfully!
        </h1>
        
        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h2 style="color: #155724; margin-top: 0;">✅ Payment Successful</h2>
          <p style="font-size: 16px; color: #155724;"><strong>Thank you for your payment!</strong> Your application has been successfully submitted and is now being processed.</p>
          ${paymentAmount && paymentCurrency ? `<p style="color: #155724;"><strong>Payment Amount:</strong> ${paymentAmount / 100} ${paymentCurrency.toUpperCase()}</p>` : ''}
          <p style="color: #155724;"><strong>Application ID:</strong> ${applicationWithDetails.id}</p>
          <p style="color: #155724;"><strong>Status:</strong> <span style="background-color: #28a745; color: white; padding: 3px 8px; border-radius: 3px;">Payment Confirmed</span></p>
        </div>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #007bff; margin-top: 0;">Application Details</h2>
          <p><strong>Application ID:</strong> ${applicationWithDetails.id}</p>
          <p><strong>Status:</strong> <span style="background-color: #28a745; color: white; padding: 3px 8px; border-radius: 3px;">${applicationWithDetails.status}</span></p>
          <p><strong>Created:</strong> ${formatDate(applicationWithDetails.created_at!)}</p>
          <p><strong>Purpose:</strong> ${applicationWithDetails.purpose}</p>
          ${applicationWithDetails.notes ? `<p><strong>Notes:</strong> ${applicationWithDetails.notes}</p>` : ''}
        </div>

        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #007bff; margin-top: 0;">Vessel Information</h2>
          <p><strong>Vessel Name:</strong> ${applicationWithDetails.vessels.name}</p>
          <p><strong>Type:</strong> ${formatVesselType(applicationWithDetails.vessels.type)}</p>
          <p><strong>Length:</strong> ${applicationWithDetails.vessels.length}m</p>
          <p><strong>Flag:</strong> ${applicationWithDetails.vessels.flag}</p>
          <p><strong>Registration Number:</strong> ${applicationWithDetails.vessels.registration_number}</p>
        </div>

        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #856404; margin-top: 0;">Captain Information</h2>
          <p><strong>Captain Name:</strong> ${applicationWithDetails.captain_name}</p>
          <p><strong>Nationality:</strong> ${applicationWithDetails.captain_nationality}</p>
          <p><strong>Passport Number:</strong> ${applicationWithDetails.captain_passport}</p>
        </div>

        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #155724; margin-top: 0;">Travel Details</h2>
          <p><strong>Departure Port:</strong> ${applicationWithDetails.departure_port}</p>
          <p><strong>Arrival Port:</strong> ${applicationWithDetails.arrival_port}</p>
          <p><strong>Departure Date:</strong> ${formatDate(applicationWithDetails.departure_date)}</p>
          <p><strong>Arrival Date:</strong> ${formatDate(applicationWithDetails.arrival_date)}</p>
          <p><strong>Crew Count:</strong> ${applicationWithDetails.crew_count}</p>
        </div>

        <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #721c24; margin-top: 0;">Contact Information</h2>
          <p><strong>Email:</strong> ${applicationWithDetails.contact_email}</p>
          <p><strong>Phone:</strong> ${applicationWithDetails.contact_phone || 'Not provided'}</p>
        </div>

        ${applicationWithDetails.document_urls && applicationWithDetails.document_urls.length > 0 ? `
        <div style="background-color: #cce5ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #004085; margin-top: 0;">Uploaded Documents</h2>
          ${applicationWithDetails.document_urls.map((url, index) => `
            <p><strong>Document ${index + 1}:</strong> 
              <a href="${url}" target="_blank" style="color: #007bff; text-decoration: none;">
                View Document
              </a>
            </p>
          `).join('')}
        </div>
        ` : ''}

        <div style="background-color: #e2e3e5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #383d41; margin-top: 0;">Passengers (${applicationWithDetails.passengers.length})</h2>
          ${passengersTable}
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px;">
            This email was generated automatically by TransLog API<br>
            If you have any questions, please contact our support team
          </p>
        </div>
      </div>
    `;

    const text = `
Application Details:
- ID: ${applicationWithDetails.id}
- Status: ${applicationWithDetails.status}
- Created: ${formatDate(applicationWithDetails.created_at!)}
- Purpose: ${applicationWithDetails.purpose}
${applicationWithDetails.notes ? `- Notes: ${applicationWithDetails.notes}` : ''}

Vessel Information:
- Name: ${applicationWithDetails.vessels.name}
- Type: ${formatVesselType(applicationWithDetails.vessels.type)}
- Length: ${applicationWithDetails.vessels.length}m
- Flag: ${applicationWithDetails.vessels.flag}
- Registration Number: ${applicationWithDetails.vessels.registration_number}

Captain Information:
- Name: ${applicationWithDetails.captain_name}
- Nationality: ${applicationWithDetails.captain_nationality}
- Passport: ${applicationWithDetails.captain_passport}

Travel Details:
- From: ${applicationWithDetails.departure_port}
- To: ${applicationWithDetails.arrival_port}
- Departure: ${formatDate(applicationWithDetails.departure_date)}
- Arrival: ${formatDate(applicationWithDetails.arrival_date)}
- Crew Count: ${applicationWithDetails.crew_count}

Contact Information:
- Email: ${applicationWithDetails.contact_email}
- Phone: ${applicationWithDetails.contact_phone || 'Not provided'}

${applicationWithDetails.document_urls && applicationWithDetails.document_urls.length > 0 ? `
Uploaded Documents:
${applicationWithDetails.document_urls.map((url, index) => `- Document ${index + 1}: ${url}`).join('\n')}
` : ''}

Passengers (${applicationWithDetails.passengers.length}):
${applicationWithDetails.passengers.map(p => 
  `- ${p.name} ${p.surname} (${p.nationality}, Passport: ${p.passport_number})`
).join('\n')}
---
This email was generated automatically by TransLog API
    `;

    await this.sendEmail({
      to: applicationWithDetails.contact_email,
      subject,
      html,
      text,
    });
  }
}