import { quarterGeneratingJob, removeJobDetailsInWard } from './resourceJobs';

const jobs = async () => {
  const choice = {
    GENERATE_QUARTERS: quarterGeneratingJob,
    REMOVE_JOB_DETAILS: removeJobDetailsInWard,
  };

  await choice.GENERATE_QUARTERS();
};

export default jobs;
