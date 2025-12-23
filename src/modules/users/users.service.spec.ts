/**
 * UsersService 单元测试
 * - 通过提供 Repository<User> 的替身（repoMock）来隔离数据库
 *
 * 参数说明：
 * - getRepositoryToken(User): 生成可注入令牌，供 Nest DI 定位仓库
 * - useValue: 提供一个对象作为仓库的替代实现（只包含所需方法）
 * - repoMock.*: Jest 的函数替代，支持返回值与断言调用
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  const usersRepositoryMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: usersRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should create user', async () => {
    const dto = {
      // name: 用户姓名
      name: 'John',
      // email: 用户邮箱
      email: 'john@example.com',
      // password: 用户密码（测试用简单字符串）
      password: 'p@ss',
      // role: 用户角色
      role: 'user',
    };
    const entity = { id: 'uuid', ...dto } as unknown as User;
    usersRepositoryMock.create.mockResolvedValue(entity);

    const result = await service.create(dto);
    expect(usersRepositoryMock.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(entity);
  });

  it('should list users', async () => {
    const list = [{ id: '1' } as unknown as User];
    usersRepositoryMock.findAll.mockResolvedValue(list);
    const result = await service.findAll();
    expect(usersRepositoryMock.findAll).toHaveBeenCalled();
    expect(result).toEqual(list);
  });

  it('should throw when user not found', async () => {
    usersRepositoryMock.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing-id')).rejects.toThrow(
      'User with ID missing-id not found',
    );
  });
});
