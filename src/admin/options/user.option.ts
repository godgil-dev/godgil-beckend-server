import { ListActionResponse, RecordActionResponse } from 'adminjs';
import * as bcrypt from 'bcrypt';

const userOptions = {
  options: {
    actions: {
      new: {
        before: async (request) => {
          if (request.payload?.password) {
            request.payload.password = await bcrypt.hash(
              request.payload.password,
              10,
            );
          }
          return request;
        },
      },
      show: {
        after: async (response: RecordActionResponse) => {
          response.record.params.password = '';
          return response;
        },
      },
      edit: {
        before: async (request) => {
          // no need to hash on GET requests, we'll remove passwords there anyway
          if (request.method === 'post') {
            // hash only if password is present, delete otherwise
            // so we don't overwrite it
            if (request.payload?.password) {
              request.payload.password = await bcrypt.hash(
                request.payload.password,
                10,
              );
            } else {
              delete request.payload?.password;
            }
          }
          return request;
        },
        after: async (response: RecordActionResponse) => {
          response.record.params.password = '';
          return response;
        },
      },
      list: {
        after: async (response: ListActionResponse) => {
          response.records.forEach((record) => {
            record.params.password = '';
          });
          return response;
        },
      },
    },
    properties: {
      password: {
        isVisible: {
          list: false,
          filter: false,
          show: false,
          edit: true, // we only show it in the edit view
        },
      },
    },
  },
};

export default userOptions;
