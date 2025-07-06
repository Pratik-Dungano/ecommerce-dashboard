import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Employee from '../models/Employee';
import { generateToken } from '../utils/jwt';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    // Find user by email
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, phone, position, department } = req.body;

    // Validate input
    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        message: 'Email, password, and name are required',
      });
      return;
    }

    // For employee role, phone is required, but position and department have defaults
    if (role === 'employee' && !phone) {
      res.status(400).json({
        success: false,
        message: 'Phone is required for employee role',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
      return;
    }

    // Create new user
    const newUser: IUser = new User({
      email,
      password,
      name,
      role: role || 'employee',
    });

    await newUser.save();

    // Create employee record only if role is employee
    if (role === 'employee') {
      // Check if employee record already exists
      const existingEmployee = await Employee.findOne({ email });
      if (!existingEmployee) {
        const newEmployee = new Employee({
          name,
          email,
          phone,
          position: position || 'General', // Default to 'General' if not provided
          department: department || 'Staff', // Default to 'Staff' if not provided
          joinDate: new Date(),
          isActive: true,
          salary: 0, // Default salary, can be updated later
        });

        await newEmployee.save();
        console.log(`✅ Employee record created for ${name} with position: ${newEmployee.position}, department: ${newEmployee.department}`);
      }
    }

    // Generate JWT token
    const token = generateToken({
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only super_admin can access this endpoint (middleware will handle this)
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only super_admin can access this endpoint (middleware will handle this)
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const superAdminCount = await User.countDocuments({ role: 'super_admin' });
    const employeeCount = await User.countDocuments({ role: 'employee' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        adminCount,
        superAdminCount,
        employeeCount,
      },
    });
  } catch (error: any) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Find the user first
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Always try to delete from Employee collection using email
    // (User might have been an employee before role change)
    const employeeDeleted = await Employee.findOneAndDelete({ email: user.email });
    
    // Delete the user from User collection
    await User.findByIdAndDelete(userId);

    // Log the deletion for debugging
    console.log(`User deleted: ${user.email}, Employee record deleted: ${employeeDeleted ? 'Yes' : 'No'}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully from both User and Employee databases',
      data: {
        userDeleted: true,
        employeeDeleted: !!employeeDeleted,
      },
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['super_admin', 'admin', 'employee'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be super_admin, admin or employee',
      });
      return;
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}; 