import { createUserA1, quarterGeneratingJob, removeJobDetailsInWard } from './resourceJobs';

const jobs = async () => {
  const choice = {
    GENERATE_QUARTERS: quarterGeneratingJob,
    REMOVE_JOB_DETAILS_IN_WARD: removeJobDetailsInWard,
    CREATE_USER_A1: createUserA1,
  };

  await choice.CREATE_USER_A1();
};

export default jobs;
