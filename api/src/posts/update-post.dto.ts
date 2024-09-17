import { IsArray, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { PostType } from './post.entity';
import { ImageMetadataDTO } from './post-images/image-metadata.dto';

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsNumber()
    cost?: number;

    @IsOptional()
    @IsString()
    address?: string;

    // @IsArray()
    // @IsOptional()
    // @IsString({ each: true })
    // // image?: string; // TODO: change to images: string[]
    // images: string[]
    @IsArray()
    imagesData: ImageMetadataDTO[];

    @IsOptional()
    @IsString()
    @IsIn(['Roommate', 'Sublet', 'Housing'], { message: 'Invalid post type' })
    type?: PostType;
}
