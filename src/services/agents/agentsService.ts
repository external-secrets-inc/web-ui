import { getAuthHeaders } from '@/services/auth/authHelpers';
import { apiWrapper } from '@/services/servicesHelpers';
import { Agent } from '@/types';
import axiosInstance from '../axiosConfig';

const headers = getAuthHeaders();

export async function createAgent(name: string) {
  return apiWrapper(async () => {
    const response = await axiosInstance.post('/api/agents', { name }, { headers });
    return response.data;
  }, 'Failed to create agent');
}

export async function getAgents() {
  return apiWrapper(async () => {
    const response = await axiosInstance.get('/api/agents', { headers });
    return response.data.agents.map((agent: Agent) => ({
      ...agent,
      agentName: agent.name,
      currentStatus: agent.current_status
    }));
  }, 'Failed to fetch agents');
}

export async function getManifestContent(id: string, version: string = 'latest') {
  return apiWrapper(async () => {
    const url = `/api/agents/${id}/manifest/${version}`;
    const response = await axiosInstance.get(url, { headers });
    return response.data.manifest;
  }, 'Failed to fetch manifest content');
}

export async function deleteAgent(id: string) {
  return apiWrapper(async () => {
    const url = `/api/agents/${id}`;
    await axiosInstance.delete(url, { headers });
  }, 'Failed to delete agent');
}