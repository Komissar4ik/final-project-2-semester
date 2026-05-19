import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsService } from './comments.service';

const prismaMock = {
  post: {
    findUnique: jest.fn(),
  },
  comment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  commentLike: {
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CommentsService(prismaMock as never);
  });

  it('creates a comment when the post exists', async () => {
    prismaMock.post.findUnique.mockResolvedValue({ id: 'post-1' });
    prismaMock.comment.create.mockResolvedValue({ id: 'comment-1' });

    await expect(service.create('post-1', 'user-1', { content: 'Nice post' })).resolves.toEqual({
      id: 'comment-1',
    });

    expect(prismaMock.comment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          postId: 'post-1',
          authorId: 'user-1',
          content: 'Nice post',
        },
      }),
    );
  });

  it('throws NotFoundException when creating a comment for a missing post', async () => {
    prismaMock.post.findUnique.mockResolvedValue(null);

    await expect(service.create('missing', 'user-1', { content: 'Nope' }))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns comments for an existing post', async () => {
    prismaMock.post.findUnique.mockResolvedValue({ id: 'post-1' });
    prismaMock.comment.findMany.mockResolvedValue([{ id: 'comment-1' }]);

    await expect(service.findByPost('post-1')).resolves.toEqual([{ id: 'comment-1' }]);

    expect(prismaMock.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { postId: 'post-1' },
        orderBy: { createdAt: 'asc' },
      }),
    );
  });

  it('throws NotFoundException when listing comments for a missing post', async () => {
    prismaMock.post.findUnique.mockResolvedValue(null);

    await expect(service.findByPost('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes a comment owned by the current user', async () => {
    prismaMock.comment.findUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'user-1',
      post: { authorId: 'post-owner' },
    });
    prismaMock.comment.delete.mockResolvedValue({ id: 'comment-1' });

    await expect(service.remove('comment-1', 'user-1')).resolves.toEqual({ deleted: true });
    expect(prismaMock.comment.delete).toHaveBeenCalledWith({ where: { id: 'comment-1' } });
  });

  it('allows the post owner to delete a comment', async () => {
    prismaMock.comment.findUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'comment-author',
      post: { authorId: 'post-owner' },
    });
    prismaMock.comment.delete.mockResolvedValue({ id: 'comment-1' });

    await expect(service.remove('comment-1', 'post-owner')).resolves.toEqual({ deleted: true });
  });

  it('throws ForbiddenException when another user deletes a comment', async () => {
    prismaMock.comment.findUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'comment-author',
      post: { authorId: 'post-owner' },
    });

    await expect(service.remove('comment-1', 'intruder')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws NotFoundException when deleting a missing comment', async () => {
    prismaMock.comment.findUnique.mockResolvedValue(null);

    await expect(service.remove('missing', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('likes an existing comment', async () => {
    prismaMock.comment.findUnique.mockResolvedValue({ id: 'comment-1' });
    prismaMock.commentLike.upsert.mockResolvedValue({ id: 'like-1' });

    await expect(service.like('comment-1', 'user-1')).resolves.toEqual({ id: 'like-1' });

    expect(prismaMock.commentLike.upsert).toHaveBeenCalledWith({
      where: {
        commentId_userId: {
          commentId: 'comment-1',
          userId: 'user-1',
        },
      },
      update: {},
      create: {
        commentId: 'comment-1',
        userId: 'user-1',
      },
    });
  });

  it('throws NotFoundException when liking a missing comment', async () => {
    prismaMock.comment.findUnique.mockResolvedValue(null);

    await expect(service.like('missing', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('removes a like from an existing comment', async () => {
    prismaMock.comment.findUnique.mockResolvedValue({ id: 'comment-1' });
    prismaMock.commentLike.deleteMany.mockResolvedValue({ count: 1 });

    await expect(service.unlike('comment-1', 'user-1')).resolves.toEqual({ liked: false });

    expect(prismaMock.commentLike.deleteMany).toHaveBeenCalledWith({
      where: {
        commentId: 'comment-1',
        userId: 'user-1',
      },
    });
  });

  it('throws NotFoundException when unliking a missing comment', async () => {
    prismaMock.comment.findUnique.mockResolvedValue(null);

    await expect(service.unlike('missing', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
