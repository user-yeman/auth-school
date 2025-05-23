import { Meeting } from './../../../../model/tutor-meeting-model';
// import { Meeting } from '../../../../model/tutor-meeting-model';

export const mockMeetings: Meeting[] = [
  // Meeting 1: Upcoming Online Meeting
  // {
  //   id: 1,
  //   student_id: 1,
  //   tutor_id: 1,
  //   status: 'pending',
  //   created_at: '2025-03-22T04:23:51.000000Z',
  //   updated_at: '2025-03-22T04:23:51.000000Z',
  //   student: {
  //     id: 1,
  //     StudentID: 'STD0001',
  //     name: 'Honey Smith',
  //     email: 'honey.smith@example.com',
  //     phone_number: '09790084863',
  //     last_login_at: '2025-03-22 04:24:44',
  //     created_at: '2025-03-21T07:55:51.000000Z',
  //     updated_at: '2025-03-22T04:24:44.000000Z',
  //   },
  //   tutor: {
  //     id: 1,
  //     name: 'Prof. Alice Johnson',
  //     email: 'alice.johnson@example.com',
  //     phone_number: '09790023195',
  //     specialization: 'Computer Science',
  //     last_login_at: '2025-03-22 04:31:34',
  //     created_at: '2025-03-21T07:55:28.000000Z',
  //     updated_at: '2025-03-22T04:31:34.000000Z',
  //   },
  //   meeting_details: [
  //     {
  //       id: 1,
  //       arrange_date: '2025-04-15T10:00:00.000000Z',
  //       meeting_type: 'online',
  //       location: null,
  //       meeting_link: 'https://meet.example.com/abc123',
  //       online_meeting_application_type: 'Microsoft Teams',
  //       arrange_id: 1,
  //       topic: 'EWSD Coursework Discussion',
  //       description:
  //         'Review current progress on the EWSD coursework and discuss next steps.',
  //       status: 'pending',
  //       deleted_at: null,
  //       created_at: '2025-03-22T04:23:52.000000Z',
  //       updated_at: '2025-03-22T04:23:52.000000Z',
  //       details: null,
  //     },
  //   ],
  // },
  // // Meeting 2: Upcoming Physical Meeting
  // {
  //   id: 2,
  //   student_id: 2,
  //   tutor_id: 2,
  //   status: 'pending',
  //   created_at: '2025-03-22T05:10:12.000000Z',
  //   updated_at: '2025-03-22T05:10:12.000000Z',
  //   student: {
  //     id: 2,
  //     StudentID: 'STD0021',
  //     name: 'John Doe',
  //     email: 'john.doe@example.com',
  //     phone_number: '09790012345',
  //     last_login_at: '2025-03-22 05:00:00',
  //     created_at: '2025-03-21T08:00:00.000000Z',
  //     updated_at: '2025-03-22T05:00:00.000000Z',
  //   },
  //   tutor: {
  //     id: 2,
  //     name: 'Dr. Bob Carter',
  //     email: 'bob.carter@example.com',
  //     phone_number: '09790054321',
  //     specialization: 'Mathematics',
  //     last_login_at: '2025-03-22 05:15:00',
  //     created_at: '2025-03-21T08:00:00.000000Z',
  //     updated_at: '2025-03-22T05:15:00.000000Z',
  //   },
  //   meeting_details: [
  //     {
  //       id: 2,
  //       arrange_date: '2025-04-18T13:00:00.000000Z',
  //       meeting_type: 'physical',
  //       location: 'Campus, Room 1',
  //       meeting_link: null,
  //       online_meeting_application_type: null,
  //       arrange_id: 2,
  //       topic: 'RM Coursework Discussion',
  //       description:
  //         'Discuss research methodology coursework and project timeline.',
  //       status: 'pending',
  //       deleted_at: null,
  //       created_at: '2025-03-22T05:10:12.000000Z',
  //       updated_at: '2025-03-22T05:10:12.000000Z',
  //       details: null,
  //     },
  //   ],
  // },
  // // Meeting 3: Upcoming Physical Meeting
  // {
  //   id: 3,
  //   student_id: 2,
  //   tutor_id: 2,
  //   status: 'pending',
  //   created_at: '2025-03-22T06:20:30.000000Z',
  //   updated_at: '2025-03-22T06:20:30.000000Z',
  //   student: {
  //     id: 2,
  //     StudentID: 'STD0021',
  //     name: 'John Doe',
  //     email: 'john.doe@example.com',
  //     phone_number: '09790012345',
  //     last_login_at: '2025-03-22 05:00:00',
  //     created_at: '2025-03-21T08:00:00.000000Z',
  //     updated_at: '2025-03-22T05:00:00.000000Z',
  //   },
  //   tutor: {
  //     id: 2,
  //     name: 'Dr. Bob Carter',
  //     email: 'bob.carter@example.com',
  //     phone_number: '09790054321',
  //     specialization: 'Mathematics',
  //     last_login_at: '2025-03-22 05:15:00',
  //     created_at: '2025-03-21T08:00:00.000000Z',
  //     updated_at: '2025-03-22T05:15:00.000000Z',
  //   },
  //   meeting_details: [
  //     {
  //       id: 3,
  //       arrange_date: '2025-04-21T13:00:00.000000Z',
  //       meeting_type: 'physical',
  //       location: 'Campus, Room 3',
  //       meeting_link: null,
  //       online_meeting_application_type: null,
  //       arrange_id: 3,
  //       topic: 'Mobile Coursework Discussion',
  //       description:
  //         'Discuss mobile app development coursework and project requirements.',
  //       status: 'pending',
  //       deleted_at: null,
  //       created_at: '2025-03-22T06:20:30.000000Z',
  //       updated_at: '2025-03-22T06:20:30.000000Z',
  //       details: null,
  //     },
  //   ],
  // },
  // // Meeting 4: Past Online Meeting
  // {
  //   id: 4,
  //   student_id: 1,
  //   tutor_id: 1,
  //   status: 'completed',
  //   created_at: '2025-03-20T08:07:38.000000Z',
  //   updated_at: '2025-03-20T08:07:38.000000Z',
  //   student: {
  //     id: 1,
  //     StudentID: 'STD0001',
  //     name: 'Honey Smith',
  //     email: 'honey.smith@example.com',
  //     phone_number: '09790084863',
  //     last_login_at: '2025-03-22 04:24:44',
  //     created_at: '2025-03-21T07:55:51.000000Z',
  //     updated_at: '2025-03-22T04:24:44.000000Z',
  //   },
  //   tutor: {
  //     id: 1,
  //     name: 'Prof. Alice Johnson',
  //     email: 'alice.johnson@example.com',
  //     phone_number: '09790023195',
  //     specialization: 'Computer Science',
  //     last_login_at: '2025-03-22 04:31:34',
  //     created_at: '2025-03-21T07:55:28.000000Z',
  //     updated_at: '2025-03-22T04:31:34.000000Z',
  //   },
  //   meeting_details: [
  //     {
  //       id: 4,
  //       arrange_date: '2025-03-20T10:00:00.000000Z',
  //       meeting_type: 'online',
  //       location: null,
  //       meeting_link: 'https://zoom.us/j/123456789',
  //       online_meeting_application_type: 'Zoom',
  //       arrange_id: 4,
  //       topic: 'Project Discussion',
  //       description: 'Discuss project scope and deadlines.',
  //       status: 'completed',
  //       deleted_at: null,
  //       created_at: '2025-03-20T08:07:38.000000Z',
  //       updated_at: '2025-03-20T08:07:38.000000Z',
  //       details: null,
  //     },
  //   ],
  // },
  // // Meeting 5: Past Physical Meeting
  // {
  //   id: 5,
  //   student_id: 2,
  //   tutor_id: 2,
  //   status: 'completed',
  //   created_at: '2025-03-19T09:15:00.000000Z',
  //   updated_at: '2025-03-19T09:15:00.000000Z',
  //   student: {
  //     id: 2,
  //     StudentID: 'STD0021',
  //     name: 'John Doe',
  //     email: 'john.doe@example.com',
  //     phone_number: '09790012345',
  //     last_login_at: '2025-03-22 05:00:00',
  //     created_at: '2025-03-21T08:00:00.000000Z',
  //     updated_at: '2025-03-22T05:00:00.000000Z',
  //   },
  //   tutor: {
  //     id: 2,
  //     name: 'Dr. Bob Carter',
  //     email: 'bob.carter@example.com',
  //     phone_number: '09790054321',
  //     specialization: 'Mathematics',
  //     last_login_at: '2025-03-22 05:15:00',
  //     created_at: '2025-03-21T08:00:00.000000Z',
  //     updated_at: '2025-03-22T05:15:00.000000Z',
  //   },
  //   meeting_details: [
  //     {
  //       id: 5,
  //       arrange_date: '2025-03-19T14:00:00.000000Z',
  //       meeting_type: 'physical',
  //       location: 'Campus, Room 3',
  //       meeting_link: null,
  //       online_meeting_application_type: null,
  //       arrange_id: 5,
  //       topic: 'Mobile Coursework Discussion',
  //       description: 'Review mobile app project progress.',
  //       status: 'completed',
  //       deleted_at: null,
  //       created_at: '2025-03-19T09:15:00.000000Z',
  //       updated_at: '2025-03-19T09:15:00.000000Z',
  //       details: null,
  //     },
  //   ],
  // },
];
