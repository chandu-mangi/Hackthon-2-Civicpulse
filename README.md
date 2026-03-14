# CivicPulse - Local Issue Reporting Hub

A complete, responsive web application for reporting and tracking local civic issues. Built with vanilla HTML, CSS, and JavaScript, featuring Google Maps integration, local data storage, and a modern mobile-first design.

## Features

### Core Functionality
- **Issue Reporting**: Submit civic issues with title, description, category, location (via Google Maps), and optional image upload
- **Issue Dashboard**: View all reported issues with filtering and sorting capabilities
- **Status Tracking**: Track issue progress through stages: Open → In Progress → Resolved
- **Upvoting**: Upvote issues to show community support
- **Comments**: Add comments to issues for community discussion
- **Filtering & Sorting**: Filter issues by category or status, sort by newest, oldest, or most upvoted

### Design Features
- **Responsive Design**: Mobile-first approach with smooth animations
- **Accessibility**: ARIA labels, keyboard navigation, focus management
- **Modern UI**: Clean interface with smooth transitions and animations
- **Modals**: Interactive modals for issue details and comments
- **Toast Notifications**: User-friendly feedback for actions

## Project Structure

```
Hackathon3/
├── index.html          # Main HTML file with all views
├── styles.css          # Complete styling with responsive design
├── script.js           # All JavaScript functionality
├── assets/             # Optional folder for icons/images
└── README.md           # This file
```

## Setup Instructions

### 1. Google Maps API Key

The application requires a Google Maps JavaScript API key. Follow these steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (for location autocomplete)
4. Create credentials (API Key)
5. Open `index.html` and replace `YOUR_API_KEY` with your actual API key:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places" async defer></script>
```

**Note**: For production use, restrict your API key to specific domains to prevent unauthorized usage.

### 2. Local Setup

1. Clone or download this project
2. Open `index.html` in a modern web browser
3. No build process or dependencies required - it's pure vanilla JavaScript!

## Usage

### Reporting an Issue

1. Click on "Report Issue" in the navigation
2. Fill in the issue details:
   - **Title**: Brief description of the issue
   - **Description**: Detailed information
   - **Category**: Select from Infrastructure, Safety, Environment, Transportation, Utilities, or Other
   - **Location**: Search for a location or click on the map to set coordinates
   - **Image** (Optional): Upload an image of the issue
3. Click "Submit Issue"
4. The issue will appear in the dashboard

### Viewing Issues

1. Navigate to "Dashboard" to see all issues
2. Use filters to narrow down issues:
   - Filter by category
   - Filter by status (Open, In Progress, Resolved)
   - Sort by newest, oldest, or most upvoted
3. Click on any issue card to view full details

### Interacting with Issues

- **Upvote**: Click the thumbs up button to upvote an issue
- **Comment**: Click the comment button to add a comment
- **View Details**: Click anywhere on an issue card to see full details in a modal

### Home Page

The home page displays:
- Statistics: Total issues, open issues, resolved issues
- Recent issues: Latest 6 issues

## Data Storage

The application uses **localStorage** to persist data in the browser. This means:
- Data is stored locally on your device
- Data persists between browser sessions
- Data is specific to each browser/device
- Sample data is included for demonstration

### Data Structure

Issues are stored with the following structure:
```javascript
{
  id: 'unique-id',
  title: 'Issue title',
  description: 'Issue description',
  category: 'infrastructure|safety|environment|transportation|utilities|other',
  status: 'open|in-progress|resolved',
  location: 'Address string',
  lat: 40.7128,
  lng: -74.0060,
  image: 'base64-encoded-image-or-null',
  upvotes: 0,
  upvotedBy: ['user-id-1', 'user-id-2'],
  comments: [
    {
      id: 'comment-id',
      text: 'Comment text',
      date: 'ISO-date-string'
    }
  ],
  createdAt: 'ISO-date-string',
  updatedAt: 'ISO-date-string'
}
```

## Customization

### Styling

All styling is in `styles.css`. Key customization points:

- **Colors**: Modify CSS variables in `:root`:
  ```css
  :root {
    --primary-color: #2563eb;
    --secondary-color: #10b981;
    /* ... */
  }
  ```

- **Layout**: Adjust grid layouts, spacing, and breakpoints
- **Animations**: Modify animation durations and effects

### Categories

To add or modify categories, update:
1. HTML: `<select>` options in the issue form and filters
2. JavaScript: `categoryLabels` object in `renderIssueCard()` and modal rendering

### Status Stages

Status stages are defined in `openIssueModal()` function. To modify:
1. Update the `statusSteps` array
2. Ensure status values match: 'open', 'in-progress', 'resolved'

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Images are stored as base64 strings in localStorage (limited to ~5-10MB per domain)
- For production, consider implementing:
  - Image compression before storage
  - Server-side storage for images
  - Pagination for large issue lists
  - IndexedDB for larger data storage

## Accessibility Features

- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- Reduced motion support (respects `prefers-reduced-motion`)

## Future Enhancements

Potential improvements for production use:
- Backend API integration
- User authentication
- Email notifications
- Image upload to cloud storage
- Advanced search functionality
- Issue assignment to authorities
- Progress tracking with updates
- Export functionality
- Multi-language support

## License

This project is provided as-is for educational and demonstration purposes.

## Support

For issues or questions, please refer to the code comments or modify the application to suit your needs.

---

**Note**: This is a frontend-only application. For production use, integrate with a backend service for data persistence, user management, and enhanced security.



