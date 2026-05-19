import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';

const prismaMock = {
  $transaction: jest.fn((queries) => Promise.all(queries)),
  post: {
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PostsService(prismaMock as never);
  });

  it('creates a post for the current author', async () => {
    prismaMock.post.create.mockResolvedValue({ id: 'post-1' });

    await expect(service.create('user-1', { content: 'Hello', imageUrl: '/uploads/a.png' }))
      .resolves.toEqual({ id: 'post-1' });

    expect(prismaMock.post.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          authorId: 'user-1',
          content: 'Hello',
          imageUrl: '/uploads/a.png',
        },
      }),
    );
  });

  it('throws NotFoundException when updating a missing post', async () => {
    prismaMock.post.findUnique.mockResolvedValue(null);

    await expect(service.update('missing', 'user-1', { content: 'Updated' }))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns a post by id when it exists', async () => {
    prismaMock.post.findUnique.mockResolvedValue({ id: 'post-1', authorId: 'owner' });

    await expect(service.findById('post-1')).resolves.toEqual({
      id: 'post-1',
      authorId: 'owner',
    });
  });

  it('throws NotFoundException when a post by id is missing', async () => {
    prismaMock.post.findUnique.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns paginated posts', async () => {
    prismaMock.post.findMany.mockResolvedValue([{ id: 'post-1' }]);
    prismaMock.post.count.mockResolvedValue(21);

    await expect(service.findAll({ page: 2, limit: 10 })).resolves.toEqual({
      items: [{ id: 'post-1' }],
      meta: {
        page: 2,
        limit: 10,
        total: 21,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });

    expect(prismaMock.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it('throws ForbiddenException when another user updates the post', async () => {
    prismaMock.post.findUnique.mockResolvedValue({ id: 'post-1', authorId: 'owner' });

    await expect(service.update('post-1', 'intruder', { content: 'Updated' }))
      .rejects.toBeInstanceOf(ForbiddenException);
  });

  it('deletes a post owned by the current user', async () => {
    prismaMock.post.findUnique.mockResolvedValue({ id: 'post-1', authorId: 'owner' });
    prismaMock.post.delete.mockResolvedValue({ id: 'post-1' });

    await expect(service.remove('post-1', 'owner')).resolves.toEqual({ deleted: true });
    expect(prismaMock.post.delete).toHaveBeenCalledWith({ where: { id: 'post-1' } });
  });

  it('throws NotFoundException when deleting a missing post', async () => {
    prismaMock.post.findUnique.mockResolvedValue(null);

    await expect(service.remove('missing', 'owner')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ForbiddenException when another user deletes the post', async () => {
    prismaMock.post.findUnique.mockResolvedValue({ id: 'post-1', authorId: 'owner' });

    await expect(service.remove('post-1', 'intruder')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
