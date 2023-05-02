export const prismaPostInclude = () => ({
  ProConDiscussion: {
    include: {
      ProConVote: true,
    },
  },
  User: {
    select: {
      username: true,
    },
  },
});
