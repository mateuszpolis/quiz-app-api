import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizService } from './quiz.service';
import { QuizResolver } from './quiz.resolver';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { UserAnswer } from './entities/user-answer.entity';
import { UserModule } from '../user/user.module';
import { QuizAccess } from './entities/quizacces.entity';
import { QuizResult } from './entities/quiz-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quiz,
      Question,
      Answer,
      UserAnswer,
      QuizAccess,
      QuizResult,
      UserAnswer,
    ]),
    UserModule,
  ],
  providers: [QuizService, QuizResolver],
})
export class QuizModule {}
