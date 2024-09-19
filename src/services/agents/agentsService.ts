import { getAuthHeaders } from '@/services/auth/authHelpers';
import { apiWrapper } from '@/services/servicesHelpers';
import { Agent, ApiWrapperOptions } from '@/types';
import axiosInstance from '../axiosConfig';

const headers = await getAuthHeaders();

export async function createAgent(name: string, options: Partial<ApiWrapperOptions> = {}) {
  return apiWrapper(async () => {
    const response = await axiosInstance.post('/api/agents', { name }, { headers });
    return response.data;
  }, { defaultError: 'Failed to create agent', ...options });
}

export async function getAgents(options: Partial<ApiWrapperOptions> = {}) {
  return apiWrapper(async () => {
    const response = await axiosInstance.get('/api/agents', { headers });
    return response.data.agents.map((agent: Agent) => ({
      ...agent,
      agentName: agent.name,
      currentStatus: agent.current_status
    }));
  }, { defaultError: 'Failed to fetch agents', ...options });
}

export async function getManifestContent(id: string, version: string = 'latest', options: Partial<ApiWrapperOptions> = {}) {
  return apiWrapper(async () => {
    const url = `/api/agents/${id}/manifest/${version}`;
    const response = await axiosInstance.get(url, { headers });
    return response.data.manifest;
  }, { defaultError: 'Failed to fetch manifest content', ...options });
}

export async function deleteAgent(id: string, options: Partial<ApiWrapperOptions> = {}) {
  return apiWrapper(async () => {
    const url = `/api/agents/${id}`;
    await axiosInstance.delete(url, { headers });
  }, { defaultError: 'Failed to delete agent', ...options });
}