import React from 'react';
import { InterviewsManagementView, Interview } from '../interviews';

interface InterviewsViewProps {
  interviews: Interview[];
  openScheduleInterviewModal: () => void;
  onUpdateInterviewFeedback: (
    interviewId: string,
    feedback: NonNullable<Interview['feedback']>
  ) => void;
}

export const InterviewsView: React.FC<InterviewsViewProps> = ({
  interviews,
  openScheduleInterviewModal,
  onUpdateInterviewFeedback,
}) => {
  return (
    <InterviewsManagementView
      initialInterviewsList={interviews}
      onScheduleInterviewExternal={openScheduleInterviewModal}
      onUpdateFeedbackExternal={onUpdateInterviewFeedback}
    />
  );
};
